CREATE TABLE IF NOT EXISTS visitor_regions (
  country TEXT NOT NULL,
  city TEXT NOT NULL,
  visits INTEGER NOT NULL DEFAULT 0 CHECK (visits >= 0),
  PRIMARY KEY (country, city)
);
