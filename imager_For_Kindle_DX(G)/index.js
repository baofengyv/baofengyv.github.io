(function(obj) {

    // 配置zip库文件的路径
    zip.workerScriptsPath = "lib/";

    var requestFileSystem = obj.webkitRequestFileSystem || obj.mozRequestFileSystem || obj.requestFileSystem;

    (function() {
        var fileInput = document.getElementById("file-input");
        var zipProgress = document.createElement("progress");
        var downloadButton = document.getElementById("download-button");

        var fileList = document.getElementById("file-list");
        var filenameInput = document.getElementById("filename-input");

        fileInput.addEventListener('change', function() {

            f = fileInput.files;
            // 循环选中的图片，对每一个图片进行分割，
            // 将分割后的图片存入一个与图片同名的zip文件中，自动下载下来
            for (var i = 0; i < fileInput.files.length; i++) {
                Seperate_Zip_Download_Img(fileInput.files[i]);
            }

        }, false);

    })();

    function Seperate_Zip_Download_Img(imgFile) {

        var imgURL = window.URL.createObjectURL(imgFile);

        // var img = document.createElement("img");
        // var img = document.getElementById("img");

        var img = new Image();

        img.onload = function() {

            var canvas = document.createElement("canvas");
            // var canvas = document.getElementById("canvas");
            canvas.width = img.width;
            canvas.height = img.height;

            var ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0);

            // 图片分页的高度
            // var SEPARATE_HEIGHT = 1200; // 全屏显示图片时 kindle dx的高度
            var SEPARATE_HEIGHT = 1159; // 非全屏显示图片时(带有状态栏) kindle dx的高度

            (function() {
                var h = canvas.height;
                var w = canvas.width;

                // 分割成每张高度为SEPARATE_HEIGHT的图片
                var images = [];
                for (var y = 0; y < h; y += SEPARATE_HEIGHT) {
                    images.push(ctx.getImageData(0, y, w, Math.min(h - y, SEPARATE_HEIGHT)));
                }

                // 写入zip文件中
                writeToZipFile(images);
            })();
        }

        img.src = imgURL;

    }

    function writeToZipFile(images) {
        var zipWriter;

        initZip(addImagesToZip);

        function initZip(initOK) {
            zip.createWriter(new zip.BlobWriter(), function(writer) {
                zipWriter = writer;
                initOK();
            });
        }

        function addImagesToZip() {

            var i = 0;

            nextFile();

            function nextFile() {
                var imgBlob = getImgBLob(images[i]);
                var fileName = "BFYImage" + (i).padLeft(2, '') + ".png";
                zipWriter.add(fileName, new zip.BlobReader(imgBlob), function() {
                    ++i;
                    if (i < images.length)
                        nextFile();
                    else
                        downLoadZip();
                });
            }
        }

        function downLoadZip() {
            zipWriter.close(function(blob) {

                var blobURL = window.URL.createObjectURL(blob);
                zipWriter = null;

                // 下载
                var downloadLink = document.createElement("a");
                downloadLink.download = "fefefname name name" + ".zip";
                downloadLink.href = blobURL;
                downloadLink.click();
                //                 fileList.innerHTML = "";
            });
        }

        function getImgBLob(img) {
            // 把图片数据画到canvas中然后取出png格式的图片数据
            var canvas = document.createElement('canvas')
            canvas.width = img.width;
            canvas.height = img.height;

            var ctx = canvas.getContext("2d");
            ctx.putImageData(img, 0, 0); // 画上

            // 取出png格式的数据
            var dataURI = canvas.toDataURL();

            // convert base64 to raw binary data held in a string
            // doesn't handle URLEncoded DataURIs
            var byteString = atob(dataURI.split(',')[1]);

            // separate out the mime component
            var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

            // write the bytes of the string to an ArrayBuffer
            var ab = new ArrayBuffer(byteString.length);
            var ia = new Uint8Array(ab);
            for (var i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
            }

            // create a blob for writing to a file
            var blob = new Blob([ab], { type: mimeString });
            return blob;
        }
    }
})(this);

/*
 *  左边填充0
 *  1->01  2->02
 */
Number.prototype.padLeft = function(n, str) {
    return Array(n - String(this).length + 1).join(str || '0') + this;
};