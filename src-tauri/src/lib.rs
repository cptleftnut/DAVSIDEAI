// src-tauri/src/lib.rs
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|_app| {
            // Din eventuelle setup-kode her
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
