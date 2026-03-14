from fastapi import FastAPI, HTTPException, Body
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import pymysql
import pymysql.cursors
from typing import List, Optional

app = FastAPI()

# Dolt acts as a MySQL server. By default, it runs on port 3306 without a password for root.
DB_CONFIG = {
    'host': '127.0.0.1',
    'port': 3306,
    'user': 'root',
    'password': '',
    'database': 'db',
    'cursorclass': pymysql.cursors.DictCursor,
    'autocommit': True
}

def get_db_connection():
    try:
        connection = pymysql.connect(**DB_CONFIG)
        return connection
    except Exception as e:
        print(f"Error connecting to DB: {e}")
        return None

class Issue(BaseModel):
    id: str
    title: str
    status: str
    severity: str
    date: str
    reporter: str
    description: str

class IssueUpdate(BaseModel):
    title: Optional[str] = None
    status: Optional[str] = None
    severity: Optional[str] = None
    reporter: Optional[str] = None
    description: Optional[str] = None

@app.get("/api/issues", response_model=List[Issue])
def get_issues():
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database connection error")
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM issues ORDER BY date DESC")
            issues = cursor.fetchall()
            for issue in issues:
                if hasattr(issue['date'], 'isoformat'):
                    issue['date'] = issue['date'].isoformat()
            return issues
    finally:
        conn.close()

@app.get("/api/issues/{issue_id}", response_model=Issue)
def get_issue(issue_id: str):
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database connection error")
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM issues WHERE id = %s", (issue_id,))
            issue = cursor.fetchone()
            if not issue:
                raise HTTPException(status_code=404, detail="Issue not found")
            if hasattr(issue['date'], 'isoformat'):
                issue['date'] = issue['date'].isoformat()
            return issue
    finally:
        conn.close()

@app.post("/api/issues", response_model=Issue)
def create_issue(issue: Issue):
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database connection error")
    try:
        with conn.cursor() as cursor:
            # Check if ID already exists
            cursor.execute("SELECT id FROM issues WHERE id = %s", (issue.id,))
            if cursor.fetchone():
                raise HTTPException(status_code=400, detail="Issue ID already exists")

            query = """
                INSERT INTO issues (id, title, status, severity, date, reporter, description)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """
            cursor.execute(query, (
                issue.id, issue.title, issue.status, issue.severity,
                issue.date, issue.reporter, issue.description
            ))
            return issue
    finally:
        conn.close()

@app.put("/api/issues/{issue_id}", response_model=Issue)
def update_issue(issue_id: str, issue_update: IssueUpdate):
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database connection error")
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM issues WHERE id = %s", (issue_id,))
            current_issue = cursor.fetchone()
            if not current_issue:
                raise HTTPException(status_code=404, detail="Issue not found")

            update_fields = []
            update_values = []
            
            update_data = issue_update.model_dump(exclude_unset=True)
            for key, value in update_data.items():
                update_fields.append(f"{key} = %s")
                update_values.append(value)

            if update_fields:
                update_values.append(issue_id)
                query = f"UPDATE issues SET {', '.join(update_fields)} WHERE id = %s"
                cursor.execute(query, tuple(update_values))

            # Fetch updated and return
            cursor.execute("SELECT * FROM issues WHERE id = %s", (issue_id,))
            updated_issue = cursor.fetchone()
            if hasattr(updated_issue['date'], 'isoformat'):
                updated_issue['date'] = updated_issue['date'].isoformat()
            return updated_issue
    finally:
        conn.close()

@app.delete("/api/issues/{issue_id}")
def delete_issue(issue_id: str):
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database connection error")
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM issues WHERE id = %s", (issue_id,))
            if not cursor.fetchone():
                raise HTTPException(status_code=404, detail="Issue not found")

            cursor.execute("DELETE FROM issues WHERE id = %s", (issue_id,))
            return {"success": True}
    finally:
        conn.close()

# Avoid serving index.html manually as an endpoint since StaticFiles with html=True will serve it when visiting root.
# Only static files inside root directory:
app.mount("/", StaticFiles(directory=".", html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
