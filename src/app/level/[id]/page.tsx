import Level from "@/components/level/level";
import { RobotGreeting } from "@/components/robot-greeting";
import { LargeRobotMessage } from "@/components/large-robot-message";

export default function LevelPage() {
    return (
        <>
            <RobotGreeting />
            <LargeRobotMessage message="Hello there, challenger! Are you ready to solve the puzzle?" />
            <Level />
        </>
    );
}
