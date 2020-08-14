let count = -1;

function start(pressedBtn){
    count++;
    const file = document.getElementById("inputFile");

    if(file.files.length){ //if file exists
        let converted = [];
        const reader = new FileReader();
        reader.readAsText(file.files[0]);
        let title = file.files[0].name;  //iteraten voor zip
        newTextArea(title);
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
                else {
                    converted[0] = "This file type is not supported.";
                    converted[1] = "";
                }
                document.getElementsByClassName("hiddenOutput")[count].innerHTML = converted[1];
                if(pressedBtn == "show"){
                    show(converted[0], title);
                }
        }    
    }  
    changeTitleLinkState();
    window.addEventListener('scroll', changeTitleLinkState);
}

function convertSrt(rawsub, title){
    let lines = rawsub.split("\n");
    let text = "";
    title = title.replace(".srt", "");
    let txtText = title + "\n" + "—".repeat(title.length) + "\n";

    let htmlTime;
    for (let index = 0; index < lines.length; index++) {
        let line = lines[index];

        if(parseInt(line)){continue}
        else if( line.length <= 1){continue}
        else if( line.includes("-->")) { // Line contains time stamp
            var time = line.substring(0, line.indexOf(","));
            htmlTime = "<span id='time'>" + time + "</span>"; 
            continue}
        else{ // Line is not a line containing the time stamp
            text = text + htmlTime + line + "<br>";
            let txtLine = line;

            if(line.includes("<i>") || line.includes("</i>")) 
                txtLine = line.replace("<i>", "");
            if(line.includes("</i>")) 
                txtLine = line.replace("</i>", "");
            txtText = txtText + txtLine + "\n\n";
        }
    }
    var textList = [text, txtText];
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
            lineText = lineText + "<br>";
            let txtLineText = lineText + "\n\n";
            rawtext = rawtext + txtLineText;
            htmltext = htmltext + htmlTime + lineText;
        }
    }
    const textList = [htmltext, rawtext];

    return textList;
}


function show(data, title){
    const titleElement = document.getElementsByClassName("title")[count];
    const textArea = document.getElementsByClassName("textArea")[count];
    titleElement.innerText = title;

    textArea.className = "textArea";
    document.getElementsByClassName("text")[count].innerHTML = data;

    document.getElementsByClassName("textArea")[count].scrollIntoView(); window.scrollBy(0, -50);
}

function openTxt(index){
    const hiddenText = document.getElementsByClassName("hiddenOutput")[index].innerHTML;
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

function changeTitleLinkState(){
    let titlelinks = document.querySelectorAll(".titlelink");
    let textareas = document.querySelectorAll(".textArea");
    
    if(textareas){
        let index = textareas.length;

        while(--index && window.scrollY + 50 < textareas[index].offsetTop) {}
    
        titlelinks.forEach((titlelink) => titlelink.classList.remove("active"));
        titlelinks[index].classList.add("active");
    }
}

function newTextArea(title){
    const index = count;

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

    if(count == 0){
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