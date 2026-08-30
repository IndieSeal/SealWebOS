import { BuildingWindow, PaintOption } from "./moving_seal.js";
import { getWindow } from "./window_manager.js";

var sandBuildWindow = new BuildingWindow('sandbuilder', getWindow('sandbuilderwindow'));
var sandOption1 = new PaintOption(sandBuildWindow, "sandcastle", './imgs/sandbuilder/sandcastle.png', 96, 96, -48, -48);
var sandOption2 = new PaintOption(sandBuildWindow, "starfish", './imgs/sandbuilder/starfish.svg', 64, 64, -16, -16, true, true);
var sandOption3 = new PaintOption(sandBuildWindow, "sanddollar", './imgs/sandbuilder/sanddollar.svg', 32, 32, -8, -8, true, true);
sandBuildWindow.setup([sandOption1, sandOption2, sandOption3]);