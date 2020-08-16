const inputForm = document.getElementById("inputForm");
const inputfields = document.getElementById("inputFields");
const inputFiles = document.getElementsByClassName("inputFile");

let inputstates = { 1: true }
let inputcount = 1;
function addInput(inputnum){
    if(document.getElementById("input" + inputnum)) {
        if(inputstates[inputnum] === true && document.getElementById("input" + inputnum).files.length) { // Input field hasn't changed yet
            inputcount = inputcount + 1;
            inputstates[inputcount] = true;
    
            const inputfield = document.createElement("input");
            inputfield.type = "file";
            inputfield.className = "inputFile";
            inputfield.id = "input" + inputcount;
            inputfield.accept = ".srt, .ass";

            const num = parseInt(inputfield.id.replace("input", ""));
            inputfield.onchange = function() {
                addInput(num);
            };
            inputfields.appendChild(inputfield);
    
            inputstates[inputnum] = false;    
        }
        else if(!document.getElementById("input" + inputnum).files.length) { // Input field was cleared
            inputfields.removeChild(document.getElementById("input" + inputnum));
        }
    }
}

// let count;
function start(){
    const inputFiles = document.getElementsByClassName("inputFile");
    const currentcount = document.getElementsByClassName("textArea").length;
    Array.from(inputFiles).forEach((file, i) => {
        if(file.files.length){ //if file exists
            let converted = [];
            const reader = new FileReader();
            reader.readAsText(file.files[0]);
            let title = file.files[0].name;  //iteraten voor zip
            newTextArea(title, i + currentcount);
            reader.onload = function(e){
                    const rawsub = e.target.result;
                    if(title.endsWith(".srt")){
                        converted = convertSrt(rawsub, title);
                        title = title.replace(".srt", "");
                    }
                    else if(title.endsWith(".ass")){
                        converted = convertAss(rawsub, title);
                        title = title.replace(".ass", "");
                    }
                    else{
                        converted[0] = "This file type is not supported.";
                        converted[1] = "";
                    }
                    document.getElementsByClassName("hiddenOutput")[i + currentcount].innerHTML = converted[1];
                    show(converted[0], title, i + currentcount);
            }    
        } 
    });
    changeTitleLinkState();
    window.addEventListener('scroll', changeTitleLinkState);
    resetInputFields();
}

function resetInputFields() {
    inputcount = 1;
    inputstates = { 1: true }
    inputfields.innerHTML = "<input type='file' class='inputFile' id='input1' onchange='addInput(1)' accept='.srt, .ass'>"
}

function convertSrt(rawsub, title){
    let lines = rawsub.split("\n");
    let text = "";
    title = title.replace(".srt", "");
    let txtText = title + "\n" + "—".repeat(title.length) + "\n";

    let htmlTime;
    for (let index = 0; index < lines.length; index++) {
        let line = lines[index];

        if( line.includes("-->") && line.includes(":")) { // Line contains time stamp
            var time = line.substring(0, line.indexOf(","));
            htmlTime = "<span id='time'>" + time + "</span>";
        }
        else if( line.length > 1 &! parseInt(line)){ // Line is not a line containing the time stamp
            text = text + htmlTime + line + "<br>";
            let txtLine = line;

            if(line.includes("<i>") || line.includes("</i>")) 
                txtLine = line.replace("<i>", "");
            if(line.includes("</i>")) 
                txtLine = line.replace("</i>", "");
            txtText = txtText + txtLine + "\n\n";
        }
    }
    const textList = [text, txtText];
    return textList;
}

function convertAss(rawsub, title){
    rawsub = rawsub.substring(rawsub.indexOf("Dialogue:"), rawsub.length); // Gets rid of all the unneeded information in the beginning of the file 
    rawsub = rawsub.replace(/{\\i1}/g, "").replace(/{\\i0}/g, "").replace(/{[^}]*}/g, "").replace(/\\N/g, " "); // Gets rid of unwanted information in the .ass file
    let lines = rawsub.split("\n"); // Create an array with all lines
    let htmltext = "";
    title = title.replace(".ass", "");
    let rawtext = title + "\n" + "—".repeat(title.length) + "\n"; // Creates a title for raw txt
    
    let actorColor = {}; // actor:assigned color
    const colors = ["#E67E22", "#F1C40F", "#2ECC71", "#1ABC9C", "#1ABC9C", "#3498DB", "#9B59B6", "#E74C3C"];
    let previousactor;

    for (let index = 0; index < lines.length; index++) { // For each line
        let line = lines[index];

        // Splits the line's information with a pattern that might differ in amount of zero's
        let splittedLine = [];
        if(line.includes("0,0,0,,")) {
            splittedLine = line.split("0,0,0,,"); }
        else if(line.includes("00,00,00,,")) {
            splittedLine = line.split("00,00,00,,"); }
        else if(line.includes("000,000,000,,")) {
            splittedLine = line.split("000,000,000,,"); }
        else if(line.includes("0000,0000,0000,,")) {
            splittedLine = line.split("0000,0000,0000,,"); }

        if(splittedLine[1]) { // The line exists
            let time = splittedLine[0]; // The first half of a line's information contains the timestamp
            time = time.substring(time.indexOf(",") +1, time.indexOf(".")); // Grabs the exact information needed for timestamp
            if(time.substring(0, time.indexOf(":")) <= 24){
                time = "0" + time; // Adds 0 to the hour, as long as it doesn't go over 24 hours
            }
            let htmlTime = "<span id='time'>" + time + "</span>"; 


            const info = splittedLine[0].split(',');
            let actor = info[info.length - 2]; // Finds the actor in the information of the line's first half
            if(actor !== "Default"){ // If an actor is assigned
                
                if(!(actor in actorColor)) {
                    actorColor[actor] = colors[Math.floor(Math.random() * colors.length)]; // Assign random color to actor
                }
                if(previousactor !== actor) {
                    if(actor !== "") {
                        htmlTime = "</br> <span id='actor' style='color:" + actorColor[actor] + "'>" + actor.charAt(0).toUpperCase() + actor.slice(1) + "</span>" + "</br>" + htmlTime; // Actor in this line is different than previous line, so create a new actor HTML object
                    }
                    else { // Assigned actor is empty
                        htmlTime = "</br>" + htmlTime;
                    }
                }
                previousactor = actor;
            }
            
            // Adjust the line for HTML text and raw txt
            let lineText = splittedLine[1];
            let htmlLineText = lineText + "<br>";
            let txtLineText = lineText + "\n\n";
            rawtext = rawtext + txtLineText;
            htmltext = htmltext + htmlTime + htmlLineText;
        }
    }
    const textList = [htmltext, rawtext];

    return textList;
}


function show(data, title, index){
    const titleElement = document.getElementsByClassName("title")[index];
    const textArea = document.getElementsByClassName("textArea")[index];
    titleElement.innerText = title;

    textArea.className = "textArea";
    document.getElementsByClassName("text")[index].innerHTML = data;

    document.getElementsByClassName("textArea")[index].scrollIntoView(); window.scrollBy(0, -50);
}

function openTxt(index){
    const hiddenText = document.getElementsByClassName("hiddenOutput")[index].innerText;
    download(hiddenText, "converted", "text/plain;charset=utf-8");
}

function copyTxt(index, title){
    const textToCopy = document.getElementsByClassName("hiddenOutput")[index].innerText;
    navigator.clipboard.writeText(textToCopy);
    alert("Copied subtitles from:\n" + title);
}

function download(data, filename, type){
    const file = new Blob([data], {type: type});
    if(window.navigator.msSaveOrOpenBlob) //IE10+
        window.navigator.msSaveOrOpenBlob(file, filename);
    else{ //other browser support
        const a = document.createElement("a"),
            url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function(){
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 0);
    }
}

function changeTitleLinkState(){ // Shows the user what subtitle file they're looking at
    let titlelinks = document.querySelectorAll(".titlelink");
    let textareas = document.querySelectorAll(".textArea");
    
    if(textareas){
        let index = textareas.length;

        while(--index && window.scrollY + 50 < textareas[index].offsetTop) {}
    
        titlelinks.forEach((titlelink) => titlelink.classList.remove("active"));
        titlelinks[index].classList.add("active");
    }
}

function newTextArea(title, index){
    const copyBtn = document.createElement("button");
    copyBtn.className = "copyBtn";
    copyBtn.onclick = function() {copyTxt(index, title);}
    copyBtn.type = "button";
    copyBtn.innerHTML = "<img src='/img/copyicon.png'/><strong>Copy</strong>";
    const openTxtBtn = document.createElement("button");
    openTxtBtn.className = "openTxt";
    openTxtBtn.onclick = function() {openTxt(index);}
    openTxtBtn.type = "button";
    openTxtBtn.innerHTML = "<img src='/img/txtfileicon.png'/><strong>Open</strong>";
    const title_h2 = document.createElement("h2");
    title_h2.className = "title";
    const text_p = document.createElement("p");
    text_p.className = "text";
    const hiddenOutput_p = document.createElement("p");
    hiddenOutput_p.className = "hiddenOutput";

    const textAreaDiv = document.createElement("div");
    textAreaDiv.className = "textArea";
    textAreaDiv.appendChild(openTxtBtn); textAreaDiv.appendChild(copyBtn);
    textAreaDiv.appendChild(title_h2); textAreaDiv.appendChild(text_p);
    textAreaDiv.appendChild(hiddenOutput_p); document.body.appendChild(textAreaDiv);

    if(index == 0){
        homelinkBtn = document.createElement("button");
        homelinkBtn.innerText = "Home"
        homelinkBtn.className = "homelink";
        homelinkBtn.type = "button";
        homelinkBtn.onclick = function() {
            document.getElementById("mainContainer").scrollIntoView(); window.scrollBy(0, -100);}
        document.getElementById("navlist").appendChild(homelinkBtn);

        resetBtn = document.createElement("button");
        resetBtn.innerText = "Reset";
        resetBtn.className = "resetBtn";
        resetBtn.type = "button";
        resetBtn.onclick = function() { refreshPage(); }
        document.getElementById("navlist").appendChild(resetBtn);

    }
    const titlelinkBtn = document.createElement("button");
    titlelinkBtn.className = "titlelink";
    titlelinkBtn.type = "button";
    let filetitle = title.replace(".srt", "").replace(".ass", "");
    if(filetitle.length >= 60) {
        filetitle = filetitle.substring(0, 60) + "...";
    }
    titlelinkBtn.innerText = filetitle;
    titlelinkBtn.onclick = function() {
        document.getElementsByClassName("textArea")[index].scrollIntoView(); window.scrollBy(0, -50);}
    document.getElementById("navlist").appendChild(titlelinkBtn);
}

function refreshPage(){
    location.reload();
}