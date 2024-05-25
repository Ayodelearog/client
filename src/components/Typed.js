import { TypeAnimation } from "react-type-animation";

const TypingAnimation = ({ setSplashDone, setSplashRemoved }) => {
	return (
		<TypeAnimation
			sequence={[
				"Welcome to DPin",
				() => {
					setSplashDone(true);
					setSplashRemoved(true);
				},
			]}
			wrapper="span"
			cursor={true}
			repeat={2}
			style={{
				fontSize: "1.5em",
				display: "inline-block",
				color: "rgb(255, 0, 106)",
			}}
		/>
	);
};

export default TypingAnimation;
