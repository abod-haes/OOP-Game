export interface LocalSection {
  id: string;
  updatedAt: string | null;
  deletedAt: string | null;
  sectionNumber: number;
  description: string;
}

export interface LocalCodeRule {
  pattern: string;
  message: string;
  flags?: string;
}

export interface LocalLevel {
  id: string;
  updatedAt: string | null;
  deletedAt: string | null;
  name: string;
  levelNumber: number;
  sectionId: string;
  codeAnalyzerId: string;
  description: string;
  task: string;
  successMessage: string;
  previousCode: string;
  rules: LocalCodeRule[];
}

export interface LocalUserSeed {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  userName: string;
  password: string;
  email: string;
  fcmToken?: string;
}

export const LOCAL_STORAGE_KEYS = {
  users: "roborescue-local-users",
  progress: "roborescue-local-progress",
} as const;

export const LOCAL_SECTIONS: LocalSection[] = [
  {
    id: "section-classes",
    updatedAt: null,
    deletedAt: null,
    sectionNumber: 1,
    description: "Classes, objects, fields, and constructors",
  },
  {
    id: "section-encapsulation",
    updatedAt: null,
    deletedAt: null,
    sectionNumber: 2,
    description: "Encapsulation, access modifiers, and class behaviour",
  },
  {
    id: "section-inheritance",
    updatedAt: null,
    deletedAt: null,
    sectionNumber: 3,
    description: "Inheritance, super, and method overriding",
  },
  {
    id: "section-polymorphism",
    updatedAt: null,
    deletedAt: null,
    sectionNumber: 4,
    description: "Interfaces, abstraction, and polymorphism",
  },
];

export const LOCAL_LEVELS: LocalLevel[] = [
  {
    id: "classes-1",
    updatedAt: null,
    deletedAt: null,
    name: "Build the Robot Class",
    levelNumber: 1,
    sectionId: "section-classes",
    codeAnalyzerId: "local-classes-1",
    description: "The rescue robot has lost its class definition.",
    task: "Create a Robot class and instantiate it inside Main.",
    successMessage: "Robot class restored!",
    previousCode: `public class Main {
  public static void main(String[] args) {
    // Create a Robot object here
  }
}

// Create the Robot class below
`,
    rules: [
      {
        pattern: "\\bclass\\s+Robot\\b",
        message: "Create a class named Robot.",
      },
      {
        pattern: "\\bnew\\s+Robot\\s*\\(",
        message: "Create a Robot object using new Robot(...).",
      },
    ],
  },
  {
    id: "classes-2",
    updatedAt: null,
    deletedAt: null,
    name: "Add Robot Fields",
    levelNumber: 2,
    sectionId: "section-classes",
    codeAnalyzerId: "local-classes-2",
    description: "The robot cannot remember its name or battery level.",
    task: "Add name and battery fields to Robot, then assign values to them.",
    successMessage: "Robot memory modules restored!",
    previousCode: `public class Main {
  public static void main(String[] args) {
    Robot robot = new Robot();
    // Assign values to the robot fields
  }
}

class Robot {
  // Add name and battery fields
}
`,
    rules: [
      {
        pattern: "\\bString\\s+name\\b",
        message: "Add a String field named name.",
      },
      {
        pattern: "\\b(?:int|double)\\s+battery\\b",
        message: "Add a numeric field named battery.",
      },
      {
        pattern: "\\brobot\\.name\\s*=",
        message: "Assign a value to robot.name.",
      },
    ],
  },
  {
    id: "classes-3",
    updatedAt: null,
    deletedAt: null,
    name: "Power the Constructor",
    levelNumber: 3,
    sectionId: "section-classes",
    codeAnalyzerId: "local-classes-3",
    description: "The robot needs a constructor to boot with valid data.",
    task: "Create a Robot constructor that receives name and battery and stores both values.",
    successMessage: "Constructor power sequence complete!",
    previousCode: `public class Main {
  public static void main(String[] args) {
    Robot robot = new Robot("R-01", 100);
  }
}

class Robot {
  String name;
  int battery;

  // Add the constructor here
}
`,
    rules: [
      {
        pattern: "\\bRobot\\s*\\(\\s*String\\s+\\w+\\s*,\\s*int\\s+\\w+\\s*\\)",
        message: "Create a Robot(String ..., int ...) constructor.",
      },
      {
        pattern: "\\bthis\\.name\\s*=",
        message: "Store the constructor name using this.name.",
      },
      {
        pattern: "\\bthis\\.battery\\s*=",
        message: "Store the constructor battery using this.battery.",
      },
    ],
  },
  {
    id: "encapsulation-1",
    updatedAt: null,
    deletedAt: null,
    name: "Protect the Battery",
    levelNumber: 1,
    sectionId: "section-encapsulation",
    codeAnalyzerId: "local-encapsulation-1",
    description: "The battery field is exposed and can be changed incorrectly.",
    task: "Make battery private and add a public getter.",
    successMessage: "Battery access secured!",
    previousCode: `public class Main {
  public static void main(String[] args) {
    Robot robot = new Robot();
    System.out.println(robot.getBattery());
  }
}

class Robot {
  int battery = 100;

  // Protect battery and add getBattery()
}
`,
    rules: [
      {
        pattern: "\\bprivate\\s+int\\s+battery\\b",
        message: "Make battery a private int field.",
      },
      {
        pattern: "\\bpublic\\s+int\\s+getBattery\\s*\\(",
        message: "Add a public getBattery method.",
      },
      {
        pattern: "\\breturn\\s+battery\\s*;",
        message: "Return battery from getBattery().",
      },
    ],
  },
  {
    id: "encapsulation-2",
    updatedAt: null,
    deletedAt: null,
    name: "Validate Battery Updates",
    levelNumber: 2,
    sectionId: "section-encapsulation",
    codeAnalyzerId: "local-encapsulation-2",
    description: "The robot accepts impossible battery values.",
    task: "Add setBattery(int battery) and only accept values from 0 to 100.",
    successMessage: "Battery validation activated!",
    previousCode: `public class Main {
  public static void main(String[] args) {
    Robot robot = new Robot();
    robot.setBattery(80);
    System.out.println(robot.getBattery());
  }
}

class Robot {
  private int battery = 100;

  public int getBattery() {
    return battery;
  }

  // Add a validated setter
}
`,
    rules: [
      {
        pattern: "\\bvoid\\s+setBattery\\s*\\(\\s*int\\s+\\w+\\s*\\)",
        message: "Add setBattery(int battery).",
      },
      {
        pattern: "\\bif\\s*\\(",
        message: "Validate the value with an if statement.",
      },
      {
        pattern: "(?:>=\\s*0|>\\s*-1)",
        message: "Check the lower battery limit.",
      },
      {
        pattern: "(?:<=\\s*100|<\\s*101)",
        message: "Check the upper battery limit.",
      },
    ],
  },
  {
    id: "encapsulation-3",
    updatedAt: null,
    deletedAt: null,
    name: "Count Active Robots",
    levelNumber: 3,
    sectionId: "section-encapsulation",
    codeAnalyzerId: "local-encapsulation-3",
    description: "The control room needs a shared count of created robots.",
    task: "Add a static robotCount field and increase it from the constructor.",
    successMessage: "Fleet counter synchronized!",
    previousCode: `public class Main {
  public static void main(String[] args) {
    new Robot();
    new Robot();
    System.out.println(Robot.robotCount);
  }
}

class Robot {
  // Add a shared robotCount field

  Robot() {
    // Increase the shared counter
  }
}
`,
    rules: [
      {
        pattern: "\\bstatic\\s+int\\s+robotCount\\b",
        message: "Add a static int robotCount field.",
      },
      {
        pattern: "(?:robotCount\\s*\\+\\+|robotCount\\s*\\+=\\s*1)",
        message: "Increase robotCount in the constructor.",
      },
    ],
  },
  {
    id: "inheritance-1",
    updatedAt: null,
    deletedAt: null,
    name: "Create a Rescue Robot",
    levelNumber: 1,
    sectionId: "section-inheritance",
    codeAnalyzerId: "local-inheritance-1",
    description: "A rescue robot should reuse the base Robot functionality.",
    task: "Create RescueRobot as a subclass of Robot.",
    successMessage: "Inheritance link established!",
    previousCode: `public class Main {
  public static void main(String[] args) {
    RescueRobot robot = new RescueRobot();
    robot.move();
  }
}

class Robot {
  void move() {
    System.out.println("Robot moving");
  }
}

// Create RescueRobot below
`,
    rules: [
      {
        pattern: "\\bclass\\s+RescueRobot\\s+extends\\s+Robot\\b",
        message: "Create RescueRobot and extend Robot.",
      },
    ],
  },
  {
    id: "inheritance-2",
    updatedAt: null,
    deletedAt: null,
    name: "Call the Parent Constructor",
    levelNumber: 2,
    sectionId: "section-inheritance",
    codeAnalyzerId: "local-inheritance-2",
    description: "The child robot must initialize the base robot data.",
    task: "Add a RescueRobot constructor and call the Robot constructor with super(name).",
    successMessage: "Parent constructor connected!",
    previousCode: `public class Main {
  public static void main(String[] args) {
    RescueRobot robot = new RescueRobot("Medic");
    System.out.println(robot.name);
  }
}

class Robot {
  String name;

  Robot(String name) {
    this.name = name;
  }
}

class RescueRobot extends Robot {
  // Add the child constructor
}
`,
    rules: [
      {
        pattern: "\\bRescueRobot\\s*\\(\\s*String\\s+\\w+\\s*\\)",
        message: "Add a RescueRobot(String ...) constructor.",
      },
      {
        pattern: "\\bsuper\\s*\\(",
        message: "Call the parent constructor with super(...).",
      },
    ],
  },
  {
    id: "inheritance-3",
    updatedAt: null,
    deletedAt: null,
    name: "Override the Repair Action",
    levelNumber: 3,
    sectionId: "section-inheritance",
    codeAnalyzerId: "local-inheritance-3",
    description: "The rescue robot needs a specialised repair action.",
    task: "Override repair() in RescueRobot and print a rescue-specific message.",
    successMessage: "Override protocol complete!",
    previousCode: `public class Main {
  public static void main(String[] args) {
    Robot robot = new RescueRobot();
    robot.repair();
  }
}

class Robot {
  void repair() {
    System.out.println("Basic repair");
  }
}

class RescueRobot extends Robot {
  // Override repair()
}
`,
    rules: [
      {
        pattern: "@Override",
        message: "Use the @Override annotation.",
      },
      {
        pattern: "\\bvoid\\s+repair\\s*\\(",
        message: "Override the repair() method.",
      },
      {
        pattern: "System\\.out\\.println\\s*\\(",
        message: "Print a rescue-specific repair message.",
      },
    ],
  },
  {
    id: "polymorphism-1",
    updatedAt: null,
    deletedAt: null,
    name: "Define Repairable",
    levelNumber: 1,
    sectionId: "section-polymorphism",
    codeAnalyzerId: "local-polymorphism-1",
    description: "Different machines need one common repair contract.",
    task: "Create a Repairable interface with a repair() method.",
    successMessage: "Repair contract created!",
    previousCode: `public class Main {
  public static void main(String[] args) {
    System.out.println("Repair system ready");
  }
}

// Create the Repairable interface below
`,
    rules: [
      {
        pattern: "\\binterface\\s+Repairable\\b",
        message: "Create an interface named Repairable.",
      },
      {
        pattern: "\\bvoid\\s+repair\\s*\\(\\s*\\)\\s*;",
        message: "Declare void repair(); in the interface.",
      },
    ],
  },
  {
    id: "polymorphism-2",
    updatedAt: null,
    deletedAt: null,
    name: "Implement the Contract",
    levelNumber: 2,
    sectionId: "section-polymorphism",
    codeAnalyzerId: "local-polymorphism-2",
    description: "The rescue robot must implement the repair contract.",
    task: "Make RescueRobot implement Repairable and provide repair().",
    successMessage: "Repair interface implemented!",
    previousCode: `public class Main {
  public static void main(String[] args) {
    Repairable machine = new RescueRobot();
    machine.repair();
  }
}

interface Repairable {
  void repair();
}

class RescueRobot {
  // Implement Repairable and add repair()
}
`,
    rules: [
      {
        pattern: "\\bclass\\s+RescueRobot\\s+implements\\s+Repairable\\b",
        message: "Make RescueRobot implement Repairable.",
      },
      {
        pattern: "\\bpublic\\s+void\\s+repair\\s*\\(",
        message: "Implement public void repair().",
      },
    ],
  },
  {
    id: "polymorphism-3",
    updatedAt: null,
    deletedAt: null,
    name: "Use Polymorphism",
    levelNumber: 3,
    sectionId: "section-polymorphism",
    codeAnalyzerId: "local-polymorphism-3",
    description: "The control room must operate different robots through one base type.",
    task: "Store RescueRobot in a Robot reference and call its overridden work() method.",
    successMessage: "Polymorphic rescue system online!",
    previousCode: `public class Main {
  public static void main(String[] args) {
    // Create a Robot reference that points to RescueRobot
  }
}

class Robot {
  void work() {
    System.out.println("Robot working");
  }
}

class RescueRobot extends Robot {
  @Override
  void work() {
    System.out.println("Rescue robot working");
  }
}
`,
    rules: [
      {
        pattern: "\\bRobot\\s+\\w+\\s*=\\s*new\\s+RescueRobot\\s*\\(",
        message: "Store a RescueRobot object in a Robot reference.",
      },
      {
        pattern: "\\.work\\s*\\(",
        message: "Call work() through the Robot reference.",
      },
    ],
  },
];

export const DEFAULT_LOCAL_USER: LocalUserSeed = {
  id: "local-demo-user",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  firstName: "Local",
  lastName: "Player",
  birthDate: "",
  userName: "player",
  password: "12345678",
  email: "player@roborescue.local",
  fcmToken: "",
};

export function getLocalLevelById(levelId: string): LocalLevel | undefined {
  return LOCAL_LEVELS.find((level) => level.id === levelId);
}

export function validateLocalLevelCode(
  levelId: string,
  code: string
): { success: boolean; errors: string[] } {
  const level = getLocalLevelById(levelId);

  if (!level) {
    return { success: false, errors: ["Level not found."] };
  }

  if (!code.trim()) {
    return { success: false, errors: ["Write your Java solution first."] };
  }

  const errors = level.rules
    .filter((rule) => {
      try {
        return !new RegExp(rule.pattern, rule.flags).test(code);
      } catch {
        return false;
      }
    })
    .map((rule) => rule.message);

  return {
    success: errors.length === 0,
    errors,
  };
}
