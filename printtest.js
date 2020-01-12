let childProcess = require('child_process');
childProcess.exec('PDFtoPrinter.exe "00.pdf"', function (err, stdout, stderr) {
        if (err) {
        console.error(err);
        return;
    }
    console.log(stdout);
    process.exit(0);// exit process once it is opened
}) 