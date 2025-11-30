const getGreeting = (): { text: string; emoji: string } => {
  const hour = new Date().getHours();
  
  if (hour >= 5 && hour < 12) {
    return { text: 'Bom dia', emoji: '☀️' };
  } else if (hour >= 12 && hour < 18) {
    return { text: 'Boa tarde', emoji: '🌤️' };
  } else {
    return { text: 'Boa noite', emoji: '🌙' };
  }
};

const getFirstName = (fullName: string | null | undefined): string => {
  if (!fullName) return 'Aniversariante';
  return fullName.split(' ')[0];
};

interface PersonalGreetingProps {
  userName: string | null | undefined;
}

export const PersonalGreeting = ({ userName }: PersonalGreetingProps) => {
  if (!userName) return null;

  const { text, emoji } = getGreeting();
  const firstName = getFirstName(userName);

  return (
    <div className="flex items-center gap-2">
      <span className="text-lg">{emoji}</span>
      <div>
        <p className="text-white font-medium text-sm">
          {text}, <span className="text-violet-400">{firstName}</span>!
        </p>
        <p className="text-slate-400 text-xs">
          Pronto pra comemorar?
        </p>
      </div>
    </div>
  );
};
