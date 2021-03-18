import { GUIInstance } from './GUIInstance.js';
import { GUIMap } from './GUIMap.js';

export class GUIExecution {
    static execution: Point[][];

    static init() { document.getElementById("buttonCompute").onclick = GUIExecution.compute; }

    static get slider() { return (document.getElementById("slider") as HTMLInputElement); }
    static get sliderValue() { return parseInt(GUIExecution.slider.value); }


    static executionLength(): number { return Math.max(...GUIExecution.execution.map((path) => path.length)); }

    static config(t: number) {
        let c = [];
        for (let agent = 0; agent < GUIExecution.execution.length; agent++)
            c.push(GUIExecution.execution[agent][Math.min(GUIExecution.execution[agent].length - 1, t)]);
        return c;
    }


    static agentPointToHTMLElement(i: number, vertex: { x: number, y: number }) {
        const img = new Image();
        img.classList.add("agent");
        img.src = "img/agent.png";
        GUIMap.setPosition(img, vertex);
        GUIMap.forAgentNumber(img, i);
        return img;
    }


    static showConfig(t: number) {
        const c = GUIExecution.config(t);
        document.getElementById("config").innerHTML = "";

        for (let agent = 0; agent < c.length; agent++) {
            document.getElementById("config").appendChild(GUIExecution.agentPointToHTMLElement(agent, c[agent]));
        }
    }


    static load(exec: Point[][]) {
        if (exec.length == 0)
            throw "No solution";
        GUIExecution.execution = exec;
        document.getElementById("paths").innerHTML = "";

        for(const path of exec) {
            document.getElementById("paths").appendChild(GUIExecution.getSVGPath(path));
        }
        GUIExecution.slider.setAttribute("max", GUIExecution.executionLength() + "");
        const f = () => { GUIExecution.showConfig(GUIExecution.sliderValue) };
        GUIExecution.slider.oninput = f;
        GUIExecution.slider.onchange = f;
        GUIExecution.slider.classList.remove("disabled");
        f();
    }



    static getSVGPath(points: Point[]): SVGPolylineElement {
        const svgns = "http://www.w3.org/2000/svg";
        const shape = document.createElementNS(svgns, "polyline");
        shape.setAttributeNS(null, 'points', points.map(GUIMap.getCenterCell).map((p) => p.x + "," + p.y).join(" "));
        return shape;
    }

    static reset() {
        GUIExecution.execution = [];
        GUIExecution.slider.setAttribute("max", GUIExecution.executionLength() + "");
        document.getElementById("config").innerHTML = "";
        GUIExecution.slider.classList.add("disabled");
        document.getElementById("paths").innerHTML = "";
    }

    static compute() {
        var fd = new FormData();
        var data = GUIInstance.instance.toObject();
        for (var i in data) {
            fd.append(i, JSON.stringify(data[i]));
        }
        fetch("compute.php", {
            method: 'post',
            body: fd
        }).then((response) => {
            if (response.ok) {
                response.text().then((str) => {
                    GUIExecution.load(eval(str).map((path) => path.map(GUIMap.numberToPoint)));
                });
            }
        });
    }
}