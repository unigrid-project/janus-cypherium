
const { dialog } = require('electron').remote;
var fs = require('fs');

export default class ImportFile {
    async import() {
        const properties = { properties: ['openFile'] };

        const options = {
            title: 'Open keystore file',
            //defaultPath: '/path/to/something/',
            buttonLabel: 'Open',
            filters: [
                { name: 'keystore', extensions: ['keystore'] }
            ],
            //properties: ['showHiddenFiles'],
            //message: 'This message will only be shown on macOS'
        };

        return await new Promise((resolve, reject) => {
            dialog.showOpenDialog(null, options, (filePaths) => {
                console.log("filePaths: ", filePaths)
            }).then((result) => {
                console.log("result: ", result.filePaths)
                fs.readFile(result.filePaths[0], 'utf-8', (stderr, data) => {
                    if (stderr) {
                        console.log("An error ocurred reading the file :" + stderr.message);
                        reject(stderr);
                    }
                    // Change how to handle the file content
                    console.log("The file content is : " + data);
                    let obj = {
                        data: JSON.parse(data),
                        path: result.filePaths[0]
                    }
                    resolve(obj);
                });
            }).catch(stderr => {
                console.log(stderr)
                reject(stderr);
            });
        }, (stderr) => {
            reject(stderr);
        });
        /* dialog.showOpenDialog((properties) => {
             // fileNames is an array that contains all the selected
             if (fileNames === undefined) {
                 console.log("No file selected");
                 return;
             }
 
             fs.readFile(filepath, 'utf-8', (err, data) => {
                 if (err) {
                     alert("An error ocurred reading the file :" + err.message);
                     return;
                 }
 
                 // Change how to handle the file content
                 console.log("The file content is : " + data);
             });
         });*/
    }
}