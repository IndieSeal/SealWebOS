import { BuildingWindow, PaintOption } from "./moving_seal.js";

var sandBuildWindow = new BuildingWindow('sandbuilder');
var sandOption1 = new PaintOption(sandBuildWindow, "sandcastle", './imgs/sandbuilder/sandcastle.png', 64, 64, -16, -16);
sandBuildWindow.setup([sandOption1]);