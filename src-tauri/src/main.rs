use reqwest::{Client, header};
use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Manager, State};
use std::sync::Arc;
use tokio::sync::Mutex;
use tauri_plugin_store::StoreExt;

#[derive(Serialize, Deserialize)]
struct BoligSearchRequest {
    query: String,
    min_price: Option<u32>,
    max_price: Option<u32>,
    min_size: Option<u32>,
}

#[derive(Serialize, Deserialize)]
struct BoligResult {
    title: String,
    price: u32,
    size: u32,
    location: String,
    link: Option<String>,
}

#[derive(Serialize, Deserialize)]
struct StagingRequest {
    prompt: String,
    base_image: Option<String>,
    mode: String, // "image" or "video"
}

struct AppState {
    client: Client,
}

// Udvidet Boligsøgning
#[tauri::command]
async fn search_boliger(req: BoligSearchRequest) -> Result<Vec<BoligResult>, String> {
    let results = vec![
        BoligResult {
            title: "Lys 2-værelses på Østerbro".to_string(),
            price: 13400,
            size: 72,
            location: "Østerbro, København".to_string(),
            link: Some("https://boligsiden.dk/bolig/12345".to_string()),
        },
        BoligResult {
            title: "Moderne 3-værelses Frederiksberg".to_string(),
            price: 14900,
            size: 85,
            location: "Frederiksberg C".to_string(),
            link: None,
        },
    ];
    Ok(results)
}

#[tauri::command]
async fn generate_staging(req: StagingRequest, state: State<'_, Arc<Mutex<AppState>>>) -> Result<String, String> {
    let client = { state.lock().await.client.clone() };
    let api_key = std::env::var("XAI_API_KEY").map_err(|_| "XAI_API_KEY mangler".to_string())?;

    let model = if req.mode == "video" { "grok-imagine-video" } else { "grok-imagine-image" };
    let endpoint = if req.mode == "video" {
        "https://api.x.ai/v1/videos/generations"
    } else {
        "https://api.x.ai/v1/images/generations"
    };

    let mut payload = serde_json::json!({
        "model": model,
        "prompt": req.prompt,
    });

    if let Some(img) = req.base_image {
        payload["image_url"] = serde_json::json!(img);
    }

    let resp = client.post(endpoint)
        .header(header::AUTHORIZATION, format!("Bearer {}", api_key))
        .json(&payload)
        .send()
        .await
        .map_err(|e| e.to_string())?;

    let data: serde_json::Value = resp.json().await.map_err(|e| e.to_string())?;
    let url = data["data"][0]["url"].as_str().ok_or("Ingen URL")?.to_string();

    Ok(url)
}

#[tauri::command]
async fn validate_api_key(key: String) -> Result<bool, String> {
    Ok(key.starts_with("xai-"))
}

#[tauri::command]
async fn save_api_key(key: String, app: AppHandle) -> Result<(), String> {
    let store = app.store("settings.dat").map_err(|e| e.to_string())?;
    store.set("xai_key", serde_json::json!(key));
    store.save().map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
async fn is_first_run(app: AppHandle) -> Result<bool, String> {
    let store = app.store("settings.dat").map_err(|e| e.to_string())?;
    Ok(store.get("xai_key").is_none())
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .manage(Arc::new(Mutex::new(AppState { client: Client::new() })))
        .invoke_handler(tauri::generate_handler![
            search_boliger,
            generate_staging,
            validate_api_key,
            save_api_key,
            is_first_run
        ])
        .setup(|app| {
            let handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                if let Ok(true) = is_first_run(handle.clone()).await {
                    let _ = handle.emit("show-setup-wizard", ());
                }
            });
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error running tauri application");
}
