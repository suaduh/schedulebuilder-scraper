const puppeteer = require('puppeteer');
const axios = require('axios');
const readline = require('readline');

async function getOpenCourseInfo(courseData) {
  let openClasses = [];
  let openLectureId = null;
  let openLectureSectionNumber = null;

  for (let section of courseData) {
    // course is lecture only
    if (section.component === 'Lecture' && section.status_string === 'Open' && section.waitlist_total === 0) {
      openLectureId = section.id;
      openLectureSectionNumber = section.section_number;
    
      const location = section.meetings[0].room ? `${section.meetings[0].room.building} ${section.meetings[0].room.room}` : 'No room listed';
      openClasses.push({
        'Course ID': section.id,
        'Component': `${section.component} ${section.section_number}`,
        'Day(s)': section.meetings[0].pattern,
        'Time': `${section.meetings[0].start_time_string}-${section.meetings[0].end_time_string}`,
        'Location': location,
        'Instructor': section.meetings[0].instructors.length > 0 ? section.meetings[0].instructors[0].label_name : 'N/A',
        'Instruction Mode': section.instruction_mode,
        'Enrollment': `${section.enrolled_total}/${section.capacity}`,
      });
    }
    // course has a lab/discussion component
    if (section.component !== 'Lecture' && section.status_string === 'Open' && section.waitlist_total === 0 && section.auto_enroll_sections.includes(openLectureId)) {
      const location = section.meetings[0].room ? `${section.meetings[0].room.building} ${section.meetings[0].room.room}` : 'No room listed';
      openClasses.push({
        'Course ID': section.id,
        'Component': `${section.component} ${section.section_number}`,
        'Day(s)': section.meetings[0].pattern,
        'Time': `${section.meetings[0].start_time_string}-${section.meetings[0].end_time_string}`,
        'Location': location,
        'Instructor': section.meetings[0].instructors.length > 0 ? section.meetings[0].instructors[0].label_name : 'N/A',
        'Instruction Mode': section.instruction_mode,
        'Enrollment': `${section.enrolled_total}/${section.capacity}`,
        'Associated Lecture Section Number': openLectureSectionNumber,
        'Associated Lecture ID': openLectureId,
      });
    }
  }

  return openClasses;
}

async function getUserInput(prompt) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve, reject) => {
    rl.question(prompt, (input) => {
      rl.close();
      resolve(input);
    });
  });
}

(async () => {
  const semester = await getUserInput('Enter the semester (e.g. Spring 2024): ');
  const course = await getUserInput('Enter the course (e.g. CHEM 1062): ');

  const [term, year] = semester.trim().split(' ');
  const [department, courseNumber] = course.trim().split(' ');

  const url = `https://schedulebuilder.umn.edu/explore/${year}${term.charAt(0).toUpperCase() + term.slice(1).toLowerCase()}/${department.toUpperCase()}/${courseNumber}/`;

  const browser = await puppeteer.launch({ headless: "new" });

  const page = await browser.newPage();

  // listen for all network requests
  page.on('requestfinished', async request => {
    if (request.url().startsWith('https://schedulebuilder.umn.edu/api.php?type=sections&institution=')) {
      // makes a request to the URL using axios
      try {
        const response = await axios.get(request.url());
        const openSections = await getOpenCourseInfo(response.data);
        console.log('Open Sections:', JSON.stringify(openSections, null, 2));
      } catch (error) {
        console.error('Error making Axios request:', error);
      }
    }
  });

  // replace with the URL generated from user input
  await page.goto(url);

  // wair for 5 seconds before closing the browser
  await new Promise(resolve => setTimeout(resolve, 5000));

  await browser.close();
})();
