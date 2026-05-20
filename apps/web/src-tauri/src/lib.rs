use std::{
    fs,
    process::Command,
    thread,
    time::Duration,
};

use tauri::{
    AppHandle,
    Manager,
};

#[tauri::command]
fn restore_database(
    app: AppHandle,
    backup_path: String,
) -> Result<(), String> {
    let app_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| e.to_string())?;

    let db_path =
        app_dir.join("pos.db");

    // REMOVE OLD DB
    let _ =
        fs::remove_file(&db_path);

    // COPY BACKUP → pos.db
    fs::copy(
        &backup_path,
        &db_path,
    )
    .map_err(|e| e.to_string())?;

    // RESTART APP
    let exe =
        std::env::current_exe()
            .map_err(|e| e.to_string())?;

    Command::new(exe)
        .spawn()
        .map_err(|e| e.to_string())?;

    // SMALL DELAY
    thread::sleep(
        Duration::from_millis(300),
    );

    // CLOSE CURRENT INSTANCE
    app.exit(0);

    Ok(())
}

#[cfg_attr(
    mobile,
    tauri::mobile_entry_point
)]
pub fn run() {
    tauri::Builder::default()
        .plugin(
            tauri_plugin_process::init(),
        )
        .plugin(
            tauri_plugin_dialog::init(),
        )
        .plugin(
            tauri_plugin_fs::init(),
        )
        .plugin(
            tauri_plugin_os::init(),
        )
        .plugin(
            tauri_plugin_sql::Builder::new()
                .build(),
        )

        .invoke_handler(
            tauri::generate_handler![
                restore_database
            ],
        )

        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(
                            log::LevelFilter::Info,
                        )
                        .build(),
                )?;
            }

            Ok(())
        })

        .run(
            tauri::generate_context!(),
        )
        .expect(
            "error while running tauri application",
        );
}