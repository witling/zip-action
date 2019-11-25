import * as core from '@actions/core';
import * as fs from 'fs';
import * as path from 'path';
import * as archiver from 'archiver';

interface IInput {
    path: string,
    include: string,
}

interface IOutput {
    path: string,
}

function getInput(): IInput {
    let input = {
        path: core.getInput('path'),
        include: core.getInput('include'),
    };
    return input;
}

function setOutput(output: IOutput) {
    core.setOutput('path', output.path);
}

function append(archive: any, name: string, full: string) {
    const absPath = path.join(full, name);
    if (fs.lstatSync(absPath).isDirectory()) {
        for (const deep of fs.readdirSync(absPath)) {
            append(archive, path.join(name, deep), full);
        }
    } else {
        console.log(`adding file ${absPath}...`);
        archive.file(absPath, { name });
    }
}

function action(input: IInput): IOutput {
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
        const output = action(input);
        setOutput(output);
    } catch (error) {
        core.setFailed(error.message);
    }
}

main()