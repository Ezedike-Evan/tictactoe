const valOrKey = (obj: any, key: string) => {
	if (!obj[key].trim()) return key;
	else return obj[key];
};

export const getHTML = (moves: any) => `
<div class = "ui">
    <div class="row">
        <input type="text" id= "A1" class="cell" value=${valOrKey(moves, "A1")}>
        <input type="text" id= "A2" class="cell" value=${valOrKey(moves, "A2")}>
        <input type="text" id= "A3" class="cell" value=${valOrKey(moves, "A3")}>
    </div>
    <div class="row">
        <input type="text" id= "B1" class="cell" value=${valOrKey(moves, "B1")}>
        <input type="text" id= "B2" class="cell" value=${valOrKey(moves, "B2")}>
        <input type="text" id= "B3" class="cell" value=${valOrKey(moves, "B3")}>
    </div>
    <div class="row">
        <input type="text" id= "C1" class="cell" value=${valOrKey(moves, "C1")}>
        <input type="text" id= "C2" class="cell" value=${valOrKey(moves, "C2")}>
        <input type="text" id= "C3" class="cell" value=${valOrKey(moves, "C3")}>
    </div>
</div>
    `;

export const getCSS = () => `
.ui {
    display: flex;
    flex-direction: column;
    align-items: center;
}
.row {
    display: flex;
}
.cell {
    border: none;
    width: 80px;
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    text-align: center;
    cursor: pointer;
}  
.cell:active {
    outline: none;
}
/* 3*3 Grid */
#A1{
    border-bottom: 1px solid gray;
    border-right: 1px solid gray;
}

#A2 {
    border-bottom: 1px solid gray;
    border-right: 1px solid gray;
    border-left: 1px solid gray;
}

#A3 {
    border-bottom: 1px solid gray;
    border-left: 1px solid gray;
}

#B1 {
    border-top: 1px solid gray;
    border-bottom: 1px solid gray;
    border-right: 1px solid gray;
}
    
#B2 {
    border: 1px solid gray;
}

#B3 {
    border-top: 1px solid gray;
    border-bottom: 1px solid gray;
    border-left: 1px solid gray;
}

#C1 {
    border-top: 1px solid gray;
    border-right: 1px solid gray;
}

#C2 {
    border-top: 1px solid gray;
    border-right: 1px solid gray;
    border-left: 1px solid gray;
}

#C3 {
    border-top: 1px solid gray;
    border-left: 1px solid gray;
}`;
