import type { User } from '@supabase/supabase-js';

export interface NotificationMessage {
  id: string;
  title: string;
  message: string;
  date: string;
  time: string;
  unread: boolean;
}

const requiredProfileFields = [
  'first_name',
  'last_name',
  'cpf',
  'phone',
  'birthdate',
  'cep',
  'street',
  'number',
  'complement',
  'neighborhood',
  'city',
  'state',
];

const formatDate = (value: Date) => {
  const pad = (num: number) => String(num).padStart(2, '0');
  return `${pad(value.getDate())}/${pad(value.getMonth() + 1)}/${value.getFullYear()}`;
};

const formatTime = (value: Date) => {
  const pad = (num: number) => String(num).padStart(2, '0');
  return `${pad(value.getHours())}:${pad(value.getMinutes())}`;
};

const isProfileComplete = (user: User) => {
  const metadata = user.user_metadata as Record<string, unknown> | undefined;
  if (!metadata) return false;

  return requiredProfileFields.every((field) => {
    const value = metadata[field];
    return typeof value === 'string' && value.trim().length > 0;
  });
};

export const getUserNotifications = (user: User): NotificationMessage[] => {
  const now = new Date();
  const date = formatDate(now);
  const time = formatTime(now);
  const complete = isProfileComplete(user);

  const notifications: NotificationMessage[] = [
    {
      id: `welcome-${user.id}`,
      title: 'Bem-vindo ao Saldo Verde',
      message: 'Sua conta foi criada com sucesso. Explore as funcionalidades e organize suas finanças aqui.',
      date,
      time,
      unread: true,
    },
  ];

  if (!complete) {
    notifications.push({
      id: `complete-profile-${user.id}`,
      title: 'Complete seu cadastro',
      message: 'Finalize seu perfil para liberar o acesso total à plataforma.',
      date,
      time,
      unread: true,
    });
  } else {
    notifications.push({
      id: `profile-complete-${user.id}`,
      title: 'Cadastro concluído',
      message: 'Tudo certo! Seu perfil está completo e você já pode usar a plataforma normalmente.',
      date,
      time,
      unread: true,
    });
  }

  return notifications;
};
