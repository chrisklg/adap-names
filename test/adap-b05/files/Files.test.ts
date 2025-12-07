import { describe, it, expect } from "vitest";

import { Exception } from "../../../src/adap-b05/common/Exception";
import { InvalidStateException } from "../../../src/adap-b05/common/InvalidStateException";
import { ServiceFailureException } from "../../../src/adap-b05/common/ServiceFailureException";

import { Node } from "../../../src/adap-b05/files/Node";
import { File } from "../../../src/adap-b05/files/File";
import { BuggyFile } from "../../../src/adap-b05/files/BuggyFile";
import { Directory } from "../../../src/adap-b05/files/Directory";
import { RootNode } from "../../../src/adap-b05/files/RootNode";

function createFileSystem(): RootNode {
  let rn: RootNode = new RootNode();

  let usr: Directory = new Directory("usr", rn);
  let bin: Directory = new Directory("bin", usr);
  let ls: File = new File("ls", bin);
  let code: File = new File("code", bin);

  let media: Directory = new Directory("media", rn);

  let home: Directory = new Directory("home", rn);
  let riehle: Directory = new Directory("riehle", home);
  let bashrc: File = new File(".bashrc", riehle);
  let wallpaper: File = new File("wallpaper.jpg", riehle);
  let projects: Directory = new Directory("projects", riehle);

  return rn;
}

describe("Basic naming test", () => {
  it("test name checking", () => {
    let fs: RootNode = createFileSystem();
    let ls: Node = [...fs.findNodes("ls")][0];
    expect(ls.getFullName().asString()).toBe("usr/bin/ls");
  });
});

function createBuggySetup(): RootNode {
  let rn: RootNode = new RootNode();

  let usr: Directory = new Directory("usr", rn);
  let bin: Directory = new Directory("bin", usr);
  let ls: File = new BuggyFile("ls", bin);
  let code: File = new BuggyFile("code", bin);

  let media: Directory = new Directory("media", rn);

  let home: Directory = new Directory("home", rn);
  let riehle: Directory = new Directory("riehle", home);
  let bashrc: File = new BuggyFile(".bashrc", riehle);
  let wallpaper: File = new BuggyFile("wallpaper.jpg", riehle);
  let projects: Directory = new Directory("projects", riehle);

  return rn;
}

describe("Buggy setup test", () => {
  it("test finding files", () => {
    let threwException: boolean = false;
    try {
      let fs: RootNode = createBuggySetup();
      fs.findNodes("ls");
    } catch(er) {
      threwException = true;
      let ex: Exception = er as Exception;
      expect(ex).toBeInstanceOf(ServiceFailureException);
      expect(ex.hasTrigger()).toBe(true);
      let tx: Exception = ex.getTrigger();
      expect(tx).toBeInstanceOf(InvalidStateException);
    }
    expect(threwException).toBe(true);
  });
});

describe("Comprehensive findNodes tests", () => {
  it("should find multiple files with same name", () => {
    let rn: RootNode = new RootNode();
    let dir1: Directory = new Directory("dir1", rn);
    let dir2: Directory = new Directory("dir2", rn);
    let config1: File = new File("config.txt", dir1);
    let config2: File = new File("config.txt", dir2);

    const matches: Set<Node> = rn.findNodes("config.txt");
    expect(matches.size).toBe(2);
    expect(matches.has(config1)).toBe(true);
    expect(matches.has(config2)).toBe(true);
  });

  it("should return empty set when no matches found", () => {
    let fs: RootNode = createFileSystem();
    const matches: Set<Node> = fs.findNodes("nonexistent.txt");
    expect(matches.size).toBe(0);
  });

  it("should find directories by name", () => {
    let fs: RootNode = createFileSystem();
    const matches: Set<Node> = fs.findNodes("bin");
    expect(matches.size).toBe(1);
    const binNode: Node = [...matches][0];
    expect(binNode.getFullName().asString()).toBe("usr/bin");
  });

  it("should find files in deeply nested structure", () => {
    let rn: RootNode = new RootNode();
    let level1: Directory = new Directory("level1", rn);
    let level2: Directory = new Directory("level2", level1);
    let level3: Directory = new Directory("level3", level2);
    let deepFile: File = new File("deep.txt", level3);

    const matches: Set<Node> = rn.findNodes("deep.txt");
    expect(matches.size).toBe(1);
    expect([...matches][0].getFullName().asString()).toBe("level1/level2/level3/deep.txt");
  });

  it("should handle empty directories", () => {
    let rn: RootNode = new RootNode();
    let emptyDir: Directory = new Directory("empty", rn);

    const matches: Set<Node> = rn.findNodes("anything");
    expect(matches.size).toBe(0);
  });

  it("should find files with special characters", () => {
    let rn: RootNode = new RootNode();
    let dir: Directory = new Directory("docs", rn);
    let dotFile: File = new File(".bashrc", dir);

    const matches: Set<Node> = rn.findNodes(".bashrc");
    expect(matches.size).toBe(1);
    expect([...matches][0]).toBe(dotFile);
  });

  it("should find all nodes with same basename across entire tree", () => {
    let rn: RootNode = new RootNode();
    let dir1: Directory = new Directory("folder1", rn);
    let dir2: Directory = new Directory("folder2", rn);
    let nested: Directory = new Directory("nested", dir1);

    let readme1: File = new File("README.md", dir1);
    let readme2: File = new File("README.md", dir2);
    let readme3: File = new File("README.md", nested);

    const matches: Set<Node> = rn.findNodes("README.md");
    expect(matches.size).toBe(3);
    expect(matches.has(readme1)).toBe(true);
    expect(matches.has(readme2)).toBe(true);
    expect(matches.has(readme3)).toBe(true);
  });

  it("should search from subdirectory and find only in subtree", () => {
    let fs: RootNode = createFileSystem();
    // Find the bin directory first
    const binMatches: Set<Node> = fs.findNodes("bin");
    const binDir: Directory = [...binMatches][0] as Directory;

    // Search for "ls" starting from bin directory
    const lsMatches: Set<Node> = binDir.findNodes("ls");
    expect(lsMatches.size).toBe(1);
    expect([...lsMatches][0].getFullName().asString()).toBe("usr/bin/ls");
  });

  it("should handle single file in root", () => {
    let rn: RootNode = new RootNode();
    let singleFile: File = new File("lonely.txt", rn);

    const matches: Set<Node> = rn.findNodes("lonely.txt");
    expect(matches.size).toBe(1);
    expect([...matches][0]).toBe(singleFile);
  });

  it("should differentiate between files and directories with same name", () => {
    let rn: RootNode = new RootNode();
    let dir1: Directory = new Directory("parent", rn);
    let nameDir: Directory = new Directory("test", dir1);
    let dir2: Directory = new Directory("another", rn);
    let nameFile: File = new File("test", dir2);

    const matches: Set<Node> = rn.findNodes("test");
    expect(matches.size).toBe(2);
    expect(matches.has(nameDir)).toBe(true);
    expect(matches.has(nameFile)).toBe(true);
  });
});

describe("Exception handling tests", () => {
  it("should propagate ServiceFailureException through directory hierarchy", () => {
    let rn: RootNode = new RootNode();
    let parent: Directory = new Directory("parent", rn);
    let child: Directory = new Directory("child", parent);
    let buggy: File = new BuggyFile("buggy.txt", child);

    let threwException: boolean = false;
    try {
      rn.findNodes("buggy.txt");
    } catch(er) {
      threwException = true;
      let ex: Exception = er as Exception;
      expect(ex).toBeInstanceOf(ServiceFailureException);
      expect(ex.hasTrigger()).toBe(true);
      expect(ex.getTrigger()).toBeInstanceOf(InvalidStateException);
    }
    expect(threwException).toBe(true);
  });

  it("should maintain exception trigger chain with nested buggy files", () => {
    let rn: RootNode = new RootNode();
    let dir: Directory = new Directory("test", rn);
    let buggy1: File = new BuggyFile("file1.txt", dir);
    let buggy2: File = new BuggyFile("file2.txt", dir);

    // Both should throw when searched individually
    for (const filename of ["file1.txt", "file2.txt"]) {
      let threwException: boolean = false;
      try {
        rn.findNodes(filename);
      } catch(er) {
        threwException = true;
        let ex: Exception = er as Exception;
        expect(ex).toBeInstanceOf(ServiceFailureException);
        expect(ex.hasTrigger()).toBe(true);
        let trigger: Exception = ex.getTrigger();
        expect(trigger).toBeInstanceOf(InvalidStateException);
      }
      expect(threwException).toBe(true);
    }
  });
});
