# Schedule Scraper

This project is a web scraper designed to retrieve open course information from the University of Minnesota's [Schedule Builder](https://schedulebuilder.umn.edu/). It allows users to specify the semester and course they are interested in, and then scrapes the website to find open sections of that course.


## Technologies Used

- Node.js
- Puppeteer (web scraping and automation)
- Axios (HTTP requests)


## Usage

1. Clone this repository to your local machine.
2. Install dependencies by running `npm install puppeteer axios`.
3. Run the script using `node sbscraper.js`.
4. Follow the prompts to enter the semester (e.g., Spring 2024) and the course (e.g., CHEM 1062).
5. View the output in the console, which will display the open course sections along with their details

> This scraper relies on the current structure and endpoints of the University of Minnesota's Schedule Builder website (Spring 2024). As the site evolves, the scraping logic may be limited by potential incompatibility with future versions.
