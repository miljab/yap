function Divider() {
  return (
    <div className="flex gap-2 items-center">
      <div className="grow border-t-1 border-neutral-400 dark:border-neutral-600"></div>
      <span className="text-sm font-light">OR</span>
      <div className="grow border-t-1 border-neutral-400 dark:border-neutral-600"></div>
    </div>
  );
}

export default Divider;
