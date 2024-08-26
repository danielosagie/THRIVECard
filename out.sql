PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
CREATE TABLE documents (id INTEGER PRIMARY KEY, filename TEXT, content TEXT, timestamp TEXT);
INSERT INTO documents VALUES(1,'Jessica_Jones_2024-08-17.txt',replace('firstName: Jessica\n\nlastName: Jones\n\ncurrentGoals: Right now, I''m looking to land a remote job in operations management or e-commerce that fits with my experience and gives me some stability. I’m also working on getting certifications to make sure I''m up-to-date and ready for remote work.\n\nlongTermGoals: Down the road, I’d love to move into a senior role where I can lead big projects and make a real impact. I want a career that’s both rewarding and flexible so I can keep balancing work with family life.\n\nprofessionalExperience: I spent over seven years as a Store Manager in Chicago, where I handled everything from daily operations to managing a team of 20. I oversaw a store with $5 million in annual sales and led a renovation that boosted sales by 20%. Since moving for my husband''s Navy career, I’ve been freelancing, helping small businesses with their operations and marketing.\n\nvolunteerExperience: I’ve been volunteering as a Parent Volunteer Coordinator at my kids'' school since 2018. I organize events and coordinate with other volunteers, which has helped me stay connected to the community and sharpen my organizational skills.\n\nskills: Leadership & Team Management: I’m good at leading teams and keeping everyone motivated.\nOperations Management: I know how to streamline processes and handle budgets.\nSales & Marketing: Experienced in developing strategies to boost sales and improve customer service.\nProject Management: Managed projects like store renovations successfully.\nRemote Team Management: Familiar with managing teams remotely and using virtual tools.\nE-Commerce Fundamentals: Understanding of online retail and e-commerce practices.\n\nachievements: One standout achievement was leading a store renovation that resulted in a 20% increase in sales. Also, I’ve had success as a freelance consultant, helping businesses improve their operations and marketing strategies.\n\nchallenges: Adapting to frequent relocations due to my husband’s Navy career has been a big challenge. Shifting from a stable retail role to freelancing required me to be flexible and find new ways to leverage my skills, which hasn’t always been easy but has made me more adaptable. I also took care of my 4 younger siblings as a kid living out of the foster system\n\nworkPreferences: Given my current situation, I’m looking for a remote job or one with flexible hours that can adapt to my family’s needs. Since my husband’s Navy career means we move frequently, a role that’s fully remote or has flexible work arrangements is ideal. I need a job that allows me to balance work with childcare for my two young kids, Emma and Liam. I’m also open to roles that offer some flexibility in terms of work hours, as this helps me manage unexpected changes in my family’s schedule. Essentially, I’m seeking a position that provides stability while fitting around our dynamic lifestyle.','\n',char(10)),'2024-08-16T23:43:13.585466');
CREATE TABLE streaming_responses
                 (id INTEGER PRIMARY KEY, content TEXT, timestamp TEXT);
CREATE TABLE IF NOT EXISTS "personas" (
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
CREATE INDEX idx_personas_name ON personas(name);
COMMIT;
