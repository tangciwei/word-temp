let fs = require('fs');
let path = require('path');
let Sutil = require('string');

let readFile = require('util').promisify(fs.readFile);
let writeFile = require('util').promisify(fs.writeFile);
let readdir = require('util').promisify(fs.readdir);
let mkdir = require('util').promisify(fs.mkdir);


async function generateTree(root) {
    let tree = {};
    let baseRoot = root;

    async function travel(root, tree) {
        let dirs = await readdir(root);
        let all = [];
        dirs.forEach(dir => {
            let pathname = root + '/' + dir;
            let stat = fs.lstatSync(pathname);
            // 目录的话
            if (stat.isDirectory()) {
                tree[dir] = {};
                all.push(travel(pathname, tree[dir]));
            } else {
                if (dir !== '.DS_Store' && dir.indexOf('.mp4') === -1) {

                    dir = dir.replace(/(\.\w+)$/g, '');
                    let arr = dir.split('-');
                    if (arr.length === 2) {
                        // todo
                        // dir = arr[1].trim();
                        // console.log(arr[0]);
                    }
                    tree[dir] = pathname;
                }

            }
        });

        await Promise.all(all);
    }

    await travel(root, tree);
    return tree;
}


async function getInfo() {
    let tree = await generateTree('/Users/tangciwei/Downloads/死磕之路');
    // console.log(JSON.stringify(tree))
    // return ;
    let result = [];

    Object.keys(tree).forEach((item, index1) => {
        let val1 = tree[item];
        result.push([]);

        // 每个阶段
        Object.keys(val1).forEach((item2, index2) => {
            let val2 = val1[item2];
            result[index1].push([]);

            // 每天
            if (typeof val2 === 'object') {
                Object.keys(val2).forEach(item3 => {
                    let val3 = val2[item3];
                    if (!/\.txt$/.test(val3)) {
                        // delete val2[item3]
                        return;
                    }

                    readFile(val3, 'utf8').then(res => {
                        var reURL = /((https?|ftp|file):\/\/.+)/;

                        res.replace(reURL, ($0, $1) => {

                            $1 = $1.trim();
                            if ($1) {
                                val2[item3] = $1;


                                result[index1][index2].push([item3, $1]);


                            }
                        })
                    });
                });
            }

        })
    })



    setTimeout(() => {
        // console.log(JSON.stringify(tree))
        markdownFn();
    }, 1000);

    function markdownFn() {
         let markdown = '';

        Object.keys(tree).forEach(item => {
            let val1 = tree[item];
            markdown += `# ${item} \n`;
            markdown+='-------------\n';

            Object.keys(val1).forEach(item2 => {
                let val2 = val1[item2];
                markdown += `## ${item2} \n`;
                if(typeof val2!=='object'){
                    markdown += `[${item2}](${val2})\n`;
                    return ;
                }
                Object.keys(val2).forEach(item3 => {
                    let val3 = val2[item3];
                    if(!/\.html$/.test(val3)){
                        markdown += `[${item3}](${val3})\n`;
                    }else{
                        markdown += `${item3} \n ${val3}\n`;
                    }
                    
                });

            });

        })
        console.log(markdown)
       

    }








}
getInfo()