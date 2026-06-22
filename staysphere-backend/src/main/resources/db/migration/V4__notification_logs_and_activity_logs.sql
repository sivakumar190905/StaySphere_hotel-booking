-- V4: Notification logs table recreation and Activity logs column rename

-- Recreate notification_logs
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS notification_logs;

CREATE TABLE notification_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(100) NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notification_logs_user_id ON notification_logs(user_id);

-- Alter activity_logs to rename details to description
ALTER TABLE activity_logs RENAME COLUMN details TO description;
