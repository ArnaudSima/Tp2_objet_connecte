let rectangle = document.getElementById("rectangle-container")
const rectangleGageUnit = document.createElement("div")
rectangleGageUnit.className = "rectangle-gage-unit"

const handleRectangleGage = (rectangle, rectangleGageUnit) => {

    for (let index = 0; index < 2; index++) {
        rectangle.appendChild(rectangleGageUnit.cloneNode(true))
    }


}
handleRectangleGage(rectangle, rectangleGageUnit)