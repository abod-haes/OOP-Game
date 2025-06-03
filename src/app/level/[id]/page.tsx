import Level from "@/components/level/level";
import { LargeRobotMessage } from "@/components/large-robot-message";

export default function LevelPage() {
    return (
        <div>
            <LargeRobotMessage message="Hello there, challenger! Are you ready to solve the puzzle?" />
            <Level />
        </div>
    );
}
