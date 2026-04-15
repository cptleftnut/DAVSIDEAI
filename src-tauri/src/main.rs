// src-tauri/src/main.rs
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    // Bemærk: Hvis dit projekt hedder noget andet i Cargo.toml, 
    // skal "davside_ai" rettes til det navn.
    davside_ai::run(); 
}
