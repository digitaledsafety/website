import os
import time
from playwright.sync_api import sync_playwright

os.makedirs('/home/jules/verification/screenshots', exist_ok=True)
os.makedirs('/home/jules/verification/videos', exist_ok=True)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context(
        record_video_dir='/home/jules/verification/videos',
        viewport={'width': 1280, 'height': 800}
    )
    page = context.new_page()

    # Route OData API request to mock dataset
    page.route('**/relay?action=odata*', lambda route: route.fulfill(
        status=200,
        content_type='application/json',
        body='''[
          {
            "id": "event-1",
            "title": "Empowering Underserved Communities with Open-Source STEM Tools",
            "description": "Learn how modern open-source software and low-cost hardware can transform STEM education.",
            "start": "2027-04-15T18:00:00Z",
            "end": "2027-04-15T19:30:00Z",
            "url": "https://digitaleducationandsafety.org/live/",
            "speaker": "Digital Education & Safety Team"
          }
        ]'''
    ))

    page.goto('http://127.0.0.1:8000/live/')
    page.wait_for_timeout(2000)

    screenshot_path = '/home/jules/verification/screenshots/verification.png'
    page.screenshot(path=screenshot_path, full_page=False)
    print(f"Screenshot saved to {screenshot_path}")

    context.close()
    browser.close()
