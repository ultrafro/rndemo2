export default class OMMYS {
  verbose: boolean = false;
  yarnString: string | null = null;

  lineNodes: Record<number, LineNode[]> = {};
  lines: string[] = [];

  branchPoints: LineNode[] = [];

  branches: number[] = [];
  branchPointers: number[] = [];

  skipList: number[] = [];

  jumpPoints: Record<string, number> = {};

  notifiedOfCompletion: boolean = false;
  OnComplete: (() => void) | null = null;

  lastCommands: string[] = [];

  id: string = "";

  shouldUpdate: (() => void) | null = null;

  constructor(shouldUpdate?: () => void) {
    this.id = Math.random().toString(36).substring(7);
    console.log("setting up OMMYS with id: ", this.id);
  }

  SetYarnString(yarnString: string | null) {
    if (!yarnString || yarnString.length <= 0) {
      //console.error("Yarn string is null or empty!");
      return;
    }

    this.yarnString = yarnString;

    this.jumpPoints = {};

    this.notifiedOfCompletion = false;

    const rawLines = yarnString.split("\n");

    this.lines = [];

    this.lastCommands = [];

    let isParsingTitle = false;
    let currentTitle = "";
    for (let i = 0; i < rawLines.length; i++) {
      let line = rawLines[i];

      const isTitle = line.includes("title:");
      const isNodeDefinitionEnd = line.includes("===");
      const isTitleDefinitionEnd = line.includes("---");
      const isTags = line.includes("tags:");
      const isJumpPoint = line.includes("<<jump");
      const isCommand = line.includes("<<");

      if (isTitle) {
        isParsingTitle = true;
        currentTitle = line.split("title:")[1].trim();
        this.lines.push("//" + line);
        this.jumpPoints[currentTitle] = this.lines.length - 1;

        continue;
      }

      if (isTitleDefinitionEnd) {
        isParsingTitle = false;
        this.lines.push("//" + line);

        continue;
      }

      if (isNodeDefinitionEnd) {
        this.lines.push("<<END>> //" + line);

        continue;
      }

      if (isTags) {
        this.lines.push("// " + line);
        continue;
      }

      if (line.trim().length <= 0) {
        continue;
      }

      this.lines.push(line);
    }

    this.lineNodes = {};

    this.branchPoints = this.GetBranchPoints(this.lines);

    for (let i = 0; i < this.lines.length; i++) {
      let line = this.lines[i];
      let lineIndentationLevel = this.getIndentationLevel(line);

      let newLineNode: LineNode = {
        lineNumber: i,
        indentationLevel: lineIndentationLevel,
        isBranchPoint: line.includes("->"),
      };

      //get the last branch point with a lower indentation and lower idx than this line
      //that's it's "parent"
      let parent: LineNode | null = null;
      for (let j = 0; j < this.branchPoints.length; j++) {
        let branchIndentation = this.branchPoints[j].indentationLevel;
        let indentationCorrect = branchIndentation < lineIndentationLevel;
        let comesBefore = this.branchPoints[j].lineNumber <= i;
        let branchLine =
          this.branchPoints[j].lineNumber >= 0
            ? this.lines[this.branchPoints[j].lineNumber]
            : "Root";

        if (indentationCorrect && comesBefore) {
          parent = this.branchPoints[j];
        }
      }

      if (parent) {
        let parentLineNumber = parent.lineNumber;
        let currentChildren = this.lineNodes[parentLineNumber] || [];

        currentChildren.push(newLineNode);

        this.lineNodes[parentLineNumber] = currentChildren;
      }
    }

    this.skipList = [];

    this.branches = [];
    this.branchPointers = [];

    this.branches.push(0);

    //find first non-empty point
    for (let i = 0; i < this.lines.length; i++) {
      this.accumulateCommand(this.lines[i]);

      const lineWithoutComments = this.getineWithoutCommentsAndCommands(
        this.lines[i]
      );
      if (lineWithoutComments.length > 0) {
        this.branchPointers.push(i);
        break;
      }
    }

    if (this.verbose) {
      console.log("line nodes", this.lineNodes);
      console.log("lines", this.lines);
      console.log("branch points", this.branchPoints);
    }

    if (this.shouldUpdate) {
      this.shouldUpdate();
    }
  }

  getineWithoutCommentsAndCommands(line: string) {
    return line.split("//")[0].split("<<")[0].trim();
  }

  accumulateCommand(line: string) {
    const lineWithoutComments = line.split("//")[0].trim();
    if (
      lineWithoutComments.includes("<<") &&
      !lineWithoutComments.includes("<<jump") &&
      !lineWithoutComments.includes("<<END")
    ) {
      this.lastCommands.push(lineWithoutComments);
    }
  }

  next() {
    if (this.verbose) {
      console.log("Starting Next!");
    }

    this.lastCommands = [];

    //this could be a while loop, but since the "goto" command wasn't implemented
    //this should suffice, and be safer from infinite loops
    for (let i = 0; i < this.lines.length; i++) {
      let { content, options, isComplete } = this.getCurrentNode();
      if (options.length > 0 || isComplete) {
        return;
      }
      let currentPointer = this.branchPointers[this.branchPointers.length - 1];
      let currentBranch = this.branches[this.branches.length - 1];

      if (this.verbose) {
        let allElementsInThisBranch = "";
        for (let j = 0; j < this.lineNodes[currentBranch].length; j++) {
          allElementsInThisBranch +=
            this.lines[this.lineNodes[currentBranch][j].lineNumber] + "|";
        }

        console.log(
          "current branch: " +
            currentBranch +
            " current pointer: " +
            currentPointer +
            " all elements in this branch: " +
            allElementsInThisBranch
        );
      }

      //determine how many to go forward
      let forward = 1;
      for (
        let j = currentPointer + 1;
        j < this.lineNodes[currentBranch].length;
        j++
      ) {
        this.accumulateCommand(
          this.lines[this.lineNodes[currentBranch][j].lineNumber]
        );

        const contentWithoutComments = this.getineWithoutCommentsAndCommands(
          this.lines[this.lineNodes[currentBranch][j].lineNumber]
        );

        const isEmpty = contentWithoutComments.length <= 0;

        if (
          isEmpty ||
          this.skipList.includes(this.lineNodes[currentBranch][j].lineNumber)
        ) {
          forward = j - currentPointer + 1;
          if (this.verbose) {
            console.log(
              "skip list contains: " +
                this.lines[this.lineNodes[currentBranch][j].lineNumber] +
                " forward is now: " +
                forward
            );
          }
          continue;
        } else {
          break;
        }
      }

      const isFinishedByExhaustion =
        currentPointer + forward >= this.lineNodes[currentBranch].length;
      let isFinishedByEND = false;

      if (currentPointer + forward < this.lineNodes[currentBranch].length) {
        isFinishedByEND =
          this.lines[
            this.lineNodes[currentBranch][currentPointer + forward].lineNumber
          ].includes("<<END>>");
      }

      if (isFinishedByEND) {
        this.branchPointers = [];
        this.branches = [];

        if (!this.notifiedOfCompletion) {
          this.notifiedOfCompletion = true;
          this.OnComplete?.();
        }
      }

      if (isFinishedByExhaustion || isFinishedByEND) {
        if (this.verbose) {
          console.log("branch is depleted! removing branch: " + currentBranch);
        }
        //remove this branch pointer
        this.branchPointers.pop();
        //remove this branch
        this.branches.pop();
        //if there are no more branches, we're done!
        if (this.branches.length <= 0) {
          if (!this.notifiedOfCompletion) {
            this.notifiedOfCompletion = true;
            this.OnComplete?.();
          }
        }
      } else {
        if (this.verbose) {
          console.log(
            "branch is not depleted, increasing pointer to: " +
              (currentPointer + forward)
          );
        }

        this.accumulateCommand(
          this.lines[
            this.lineNodes[currentBranch][currentPointer + forward].lineNumber
          ]
        );

        //if it's a jump, add that branch
        let lineWithoutComments =
          this.lines[
            this.lineNodes[currentBranch][currentPointer + forward].lineNumber
          ].split("//")[0];

        if (lineWithoutComments.includes("<<jump")) {
          let jumpPoint = lineWithoutComments.split("<<jump")[1].split(">>")[0];
          jumpPoint = jumpPoint.trim();
          let jumpLineNumber = this.jumpPoints[jumpPoint];
          if (jumpLineNumber) {
            //find the first non-empty line at or after the jump
            let firstNonEmptyAfterJump = -1;
            for (let i = jumpLineNumber; i < this.lines.length; i++) {
              this.accumulateCommand(this.lines[i]);

              const lineWithoutComments = this.getineWithoutCommentsAndCommands(
                this.lines[i]
              );

              // const lineWithoutComments = this.lines[i].split("//")[0].trim();
              if (lineWithoutComments.trim().length > 0) {
                firstNonEmptyAfterJump = i;
                break;
              }
            }

            const spaceAfterJumpLine = firstNonEmptyAfterJump - jumpLineNumber;

            this.branches.push(jumpLineNumber);
            this.branchPointers.push(spaceAfterJumpLine);
          }
        } else {
          this.branchPointers[this.branchPointers.length - 1] += forward;
        }

        break;
      }
    }

    if (this.shouldUpdate) {
      this.shouldUpdate();
    }
  }

  getCurrentNode(): {
    content: LineNode;
    options: LineNode[];
    isComplete: boolean;
  } {
    let isComplete = false;
    let content: LineNode = {
      lineNumber: 0,
      indentationLevel: 0,
      isBranchPoint: false,
    };
    let options: LineNode[] = [];
    let singleBranch =
      this.branches.length == 1 && this.branchPointers.length == 1;

    if (singleBranch) {
      //check length of branch:
      let childNodes = this.lineNodes[this.branches[0]] || [];
      let currentBranchPointer = this.branchPointers[0];

      //filter childNodes not on the skip list
      let validChildNodes = childNodes.filter((node, i) => {
        return (
          !this.skipList.includes(node.lineNumber) && i >= currentBranchPointer
        );
      });
      let numValidChildren = validChildNodes.length;
      if (numValidChildren <= 0) {
        isComplete = true;
      }
    }

    if (this.branches.length <= 0 || this.branchPointers.length <= 0) {
      isComplete = true;
    }

    if (isComplete) {
      if (!this.notifiedOfCompletion) {
        this.notifiedOfCompletion = true;
        this.OnComplete?.();
      }
      return { content, options, isComplete };
    }

    let currentBranch = this.branches[this.branches.length - 1];
    let currentPointer = this.branchPointers[this.branchPointers.length - 1];
    content = this.lineNodes[currentBranch][currentPointer];

    if (this.skipList.includes(content.lineNumber)) {
      if (this.verbose) {
        console.log(
          "get current node called on skipped element: " +
            this.lines[content.lineNumber] +
            ". returning early"
        );
      }
      return { content, options, isComplete };
    }

    if (content.isBranchPoint) {
      //get options:
      for (
        let j = currentPointer;
        j < this.lineNodes[currentBranch].length;
        j++
      ) {
        let node = this.lineNodes[currentBranch][j];
        if (node.isBranchPoint) {
          //add option
          options.push(node);
        } else {
          break;
        }
      }
    }

    return { content, options, isComplete };
  }

  SelectOption(optionIdx: number) {
    // this.next();
    let { content, options, isComplete } = this.getCurrentNode();
    let option = options[optionIdx];

    if (this.lineNodes.hasOwnProperty(content.lineNumber)) {
      this.branches.push(content.lineNumber);
      this.branchPointers.push(0);
    }

    for (let i = 0; i < options.length; i++) {
      let optionNode = options[i];
      this.skipList.push(optionNode.lineNumber);
      if (this.verbose) {
        console.log(
          "adding to skip list: " + this.lines[optionNode.lineNumber]
        );
      }
    }

    if (this.shouldUpdate) {
      this.shouldUpdate();
    }
  }

  PrintNodes(nodeDictionary: Record<number, LineNode[]>) {
    for (let key in nodeDictionary) {
      let parentLineNumber = parseInt(key);
      let children = nodeDictionary[parentLineNumber];

      let parentLine =
        parentLineNumber >= 0 ? this.lines[parentLineNumber] : "Root";
      let childrenString = "";
      for (let i = 0; i < children.length; i++) {
        childrenString += this.lines[children[i].lineNumber] + "|";
      }
      console.log("parent: " + parentLine + " children: " + childrenString);
    }
  }

  getIndentationLevel(line: string): number {
    let indentationLevel = 0;
    let specialLine = line.replaceAll("\t", "  ");

    for (let i = 0; i < specialLine.length; i++) {
      if (specialLine[i] == " ") {
        indentationLevel++;
      } else {
        break;
      }
    }
    return indentationLevel;
  }

  GetBranchPoints(lines: string[]): LineNode[] {
    let branchPoints: LineNode[] = [];

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      if (line.includes("->")) {
        let branchPoint: LineNode = {
          lineNumber: i,
          indentationLevel: this.getIndentationLevel(line),
          isBranchPoint: true,
        };
        branchPoints.push(branchPoint);
      }

      //check if it's a jump point
      let jumpTitle: string | null = null;
      for (const key in this.jumpPoints) {
        if (this.jumpPoints[key] == i) {
          jumpTitle = key;
        }
      }
      if (jumpTitle) {
        let branchPoint: LineNode = {
          lineNumber: i,
          indentationLevel: -1,
          isBranchPoint: true,
        };
        branchPoints.push(branchPoint);
      }
    }
    return branchPoints;
  }

  GetCurrentLine(): OMMDMNode | null {
    let { content, options, isComplete } = this.getCurrentNode();

    if (isComplete) {
      return null;
    }

    let node: OMMDMNode = {
      content: this.lines[content.lineNumber],
      options: options.map((option) => this.lines[option.lineNumber]),
      senderId:
        this.lines[content.lineNumber].split(":").length > 1
          ? this.lines[content.lineNumber].split(":")[0]
          : "",
    };

    if (options.length > 0) {
      return null;
    } else {
      return node;
    }
  }

  GetCommands(): string[] {
    return [...this.lastCommands];
  }

  GetLinesSoFar(): OMMDMNode[] {
    let nodes: OMMDMNode[] = [];

    for (let i = 0; i < this.lines.length; i++) {
      let { content, options, isComplete } = this.getCurrentNode();

      if (isComplete) {
        break;
      }

      let node: OMMDMNode = {
        content: this.lines[content.lineNumber],
        options: options.map((option) => this.lines[option.lineNumber]),
        senderId:
          this.lines[content.lineNumber].split(":").length > 1
            ? this.lines[content.lineNumber].split(":")[0]
            : "",
      };

      if (options.length > 0) {
        break;
      } else {
        nodes.push(node);
        // this.next();
      }
    }

    return nodes;
  }

  GetOptions(): OMMOption[] {
    let { content, options, isComplete } = this.getCurrentNode();

    let ommOptions: OMMOption[] = [];
    let optionsCleaned = options.map((option) => this.lines[option.lineNumber]);
    //remove "->" from all the options
    for (let i = 0; i < optionsCleaned.length; i++) {
      let removedArrowOption = optionsCleaned[i].replace("->", "");
      let textWithTags = removedArrowOption.split(" #");

      let newOption: OMMOption = {
        choiceText: textWithTags[0],
        choiceTags: textWithTags.length > 1 ? textWithTags.slice(1) : [],
      };

      ommOptions.push(newOption);
    }
    return ommOptions;
  }

  isDone(): boolean {
    let { content, options, isComplete } = this.getCurrentNode();
    return isComplete;
  }
}

export type LineNode = {
  lineNumber: number;
  indentationLevel: number;
  isBranchPoint: boolean;
};

export type OMMDMNode = {
  senderId: string;
  content: string;
  options: string[];
};

export type OMMOption = {
  choiceText: string;
  choiceTags: string[];
};
