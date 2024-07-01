INSERT INTO
    auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        recovery_sent_at,
        last_sign_in_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at,
        confirmation_token,
        email_change,
        email_change_token_new,
        recovery_token
    ) (
        select
            '00000000-0000-0000-0000-000000000000',
            uuid_generate_v4 (),
            'authenticated',
            'authenticated',
            'user' || (ROW_NUMBER() OVER ()) || '@example.com',
            crypt ('password123', gen_salt ('bf')),
            current_timestamp,
            current_timestamp,
            current_timestamp,
            '{"provider":"email","providers":["email"]}',
            '{}',
            current_timestamp,
            current_timestamp,
            '',
            '',
            '',
            ''
        FROM
            generate_series(1, 10)
    );
-- test user email identities
INSERT INTO
    auth.identities (
        id,
        user_id,
        -- New column
        provider_id,
        identity_data,
        provider,
        last_sign_in_at,
        created_at,
        updated_at
    ) (
        SELECT
            uuid_generate_v4 (),
            id,
            -- New column
            id,
            format('{"sub":"%s","email":"%s"}', id :: text, email) :: jsonb,
            'email',
            current_timestamp,
            current_timestamp,
            current_timestamp
        FROM
            auth.users
    );

-- Insert random habit names and descriptions for each user created with the above queries
INSERT INTO habits (name, description, user_id) SELECT 'Habit ' || (ROW_NUMBER() OVER ()), 'Description for habit ' || (ROW_NUMBER() OVER ()), au.id FROM auth.users au;

-- Insert habit_trackings for each habit created with the above query. completed_on_date should be a random date in the past month
INSERT INTO habit_trackings (habit_id, completed_on_date) SELECT h.id, current_date - (random() * 30)::int FROM habits h;

INSERT INTO badges (name, description, image_url) VALUES
('Week Streak', 'Maintain a streak for 7 days', 'week_streak.png'),
('Month Streak', 'Maintain a streak for 30 days', 'month_streak.png'),
('10 Completions', 'Complete a habit 10 times', 'ten_completions.png');

