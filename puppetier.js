const puppeteer = require('puppeteer');

async function printPDF() {
    try{
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto('http://localhost:9000/BOL', {waitUntil: 'networkidle0'});
    // const pdf = await page.pdf({ format: 'A4' });
    const pdfConfig = {
        path: 'BOL.pdf', // Saves pdf to disk. 
        format: 'A4',
        printBackground: true,
        margin: { // Word's default A4 margins
            top: '2.54cm',
            bottom: '2.54cm',
            left: '0 cm',
            right: '0 cm'
        }
    };
    await page.emulateMedia('screen');
    const pdf = await page.pdf(pdfConfig); // Return the pdf buffer. Useful for saving the file not to disk. 
    await browser.close();
    return pdf;
    }
    catch(err){
        console.log(err)
    }
    
  }


  
printPDF()