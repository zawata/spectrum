use tauri::Manager;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn get_app_cwd() -> String {
    std::env::current_dir().unwrap().display().to_string()
}

struct AppData {
    welcome_message: &'static str,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_log::Builder::new().build())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_http::init())
        .setup(|app| {
            app.manage(AppData {
                welcome_message: "Welcome to Tauri!",
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![greet, get_app_cwd])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
