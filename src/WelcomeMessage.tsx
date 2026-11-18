type Props = {
  uncompletedCount: number;
};

const WelcomeMessage = (props: Props) => {
  const currentTime = new Date();
  const greeting =
    currentTime.getHours() < 12 ? "おはようございます" : "こんにちは";

  return (
    <div className="text-blue-700">
      <p>{greeting}</p>
      <p className="text-sm text-slate-600">
        現在の未完了タスクは {props.uncompletedCount} 件です
      </p>
    </div>
  );
};

export default WelcomeMessage;