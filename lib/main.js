"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const archiver = __importStar(require("archiver"));
function getInput() {
    let input = {
        path: core.getInput('path'),
        include: core.getInput('include'),
    };
    return input;
}
function setOutput(output) {
    core.setOutput('path', output.path);
}
function append(archive, name, full) {
    const absPath = path.join(full, name);
    if (fs.lstatSync(absPath).isDirectory()) {
        for (const deep of fs.readdirSync(absPath)) {
            append(archive, path.join(name, deep), full);
        }
    }
    else {
        console.log(`adding file ${absPath}...`);
        archive.file(absPath, { name });
    }
}
function action(input) {
    const outstream = fs.createWriteStream(input.path);
    const archive = archiver.create('zip', {});
    const folder = process.env['GITHUB_WORKSPACE'] || '.';
    archive.pipe(outstream);
    append(archive, input.include, folder);
    archive.finalize();
    return {
        path: input.path
    };
}
function main() {
    try {
        const input = getInput();
        console.log(input);
        const output = action(input);
        setOutput(output);
    }
    catch (error) {
        core.setFailed(error.message);
    }
}
main();
