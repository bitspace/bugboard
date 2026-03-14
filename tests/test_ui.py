import pytest
from playwright.sync_api import Page, expect

BASE_URL = "http://localhost:8000"

def test_homepage_loads(page: Page):
    page.goto(BASE_URL)
    # Check if the title is Bugboard
    expect(page.locator(".logo h1")).to_have_text("Bugboard")
    
    # Check if some issues load
    expect(page.locator(".issue-card")).to_have_count(6)

def test_search_filters_issues(page: Page):
    page.goto(BASE_URL)
    
    # Search for a specific issue
    page.locator("#search-input").fill("Application crashes")
    
    # Should filter down to 1 issue
    expect(page.locator(".issue-card")).to_have_count(1)
    expect(page.locator(".issue-card .card-title")).to_have_text("Application crashes on startup when offline")

def test_click_issue_loads_details(page: Page):
    page.goto(BASE_URL)
    
    # Click the first issue card (which we know is BUG-101 based on DB mock data)
    page.locator(".issue-card").first.click()
    
    # Verify the detail pane is rendered correctly
    expect(page.locator(".detail-id")).to_have_text("BUG-101")
    expect(page.locator(".detail-title")).to_contain_text("Application crashes on startup when offline")
    
    # Switch to another issue via search
    page.locator("#search-input").fill("Dark mode toggle")
    page.locator(".issue-card").first.click()
    
    expect(page.locator(".detail-id")).to_have_text("BUG-102")
