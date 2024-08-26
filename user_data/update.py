import sqlite3

def modify_personas_table(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Read the SQL commands from a file or string
    sql_commands = """
    -- Step 1: Create a new table with the desired structure
    CREATE TABLE personas_new (
        id INTEGER PRIMARY KEY,
        name TEXT,
        professional_summary TEXT,
        goals TEXT,
        qualifications_and_education TEXT,
        skills TEXT,
        strengths TEXT,
        value_proposition TEXT,
        timestamp TEXT
    );

    -- Step 2: Copy data from the old table to the new table
    INSERT INTO personas_new (id, name, timestamp)
    SELECT id, name, timestamp
    FROM personas;

    -- Step 3: Update the new columns with data from the JSON 'data' column
    UPDATE personas_new
    SET 
        professional_summary = json_extract(personas.data, '$.professional_summary'),
        goals = json_extract(personas.data, '$.goals'),
        qualifications_and_education = json_extract(personas.data, '$.qualifications_and_education'),
        skills = json_extract(personas.data, '$.skills'),
        strengths = json_extract(personas.data, '$.strengths'),
        value_proposition = json_extract(personas.data, '$.value_proposition')
    FROM personas
    WHERE personas_new.id = personas.id;

    -- Step 4: Drop the old table
    DROP TABLE personas;

    -- Step 5: Rename the new table to the original name
    -- ALTER TABLE personas_new RENAME TO persona_log;

    -- Step 6: Create any necessary indexes (optional)
    CREATE INDEX idx_personas_name ON personas(name);
    """

    # Split the commands and execute them one by one
    for command in sql_commands.split(';'):
        if command.strip():
            cursor.execute(command)

    conn.commit()
    conn.close()

    print("Table modification completed successfully.")

# Usage
DB_PATH = '/Users/dosagie/Documents/Code Projects/GTRI/tcard-shadcn/user_data/local_db.sqlite'
modify_personas_table(DB_PATH)