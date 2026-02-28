//define funtion for fill data into table 
const filldataintotable =(tableBodyElement , datalist ,displayProperty) => {
tableBodyElement.innerHTML = "";

datalist.forEach((dataOb,index) => {
    let tr = document.createElement("tr");
    // tr.innerHTML = '<tr><td>$parseInt(index+1)</td>
    // </tr>'

    let tdNo = document.createElement("td");
    tdNo.innerText = parseInt(index) + 1;
    tr.appendChild(tdNo);

    displayProperty.forEach(displayPro => {
        let td = document.createElement("td");

        if(displayPro.datatype === "string"){
            td.innerText = dataOb[displayPro.property];
        }
         if(displayPro.datatype === "function"){
            td.innerHTML = displayPro.property(dataOb);
        }

        tr.appendChild(td);
    });


    
    let tdAction = document.createElement("td");

    let buttonEdit = document.createElement("button");
    buttonEdit.innerText = "Edit";
    buttonEdit.className = "btn btn-outline-warning fw-bold";
    tdAction.appendChild(buttonEdit);


    let buttonDelete = document.createElement("button");
    buttonDelete.innerHTML = "Delete <i class='far fa-trash-can'></i>";
    buttonDelete.className = "btn btn-outline-danger fw-bold m-2";
    tdAction.appendChild(buttonDelete);

    let buttonPrint = document.createElement("button");
    buttonPrint.innerHTML = "Print <i class='fa-regular fa-eye'></i>";
    buttonPrint.className = "btn btn-outline-success fw-bold";
    tdAction.appendChild(buttonPrint);

    tr.appendChild(tdAction);

    tableBodyElement.appendChild(tr);
    
});

}