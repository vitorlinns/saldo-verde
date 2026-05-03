import { useEffect, useState, type CSSProperties, type FormEvent, type InputHTMLAttributes } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Session, SupabaseClient } from '@supabase/supabase-js';
import Sidebar from '../../components/sidebar/sidebar';
import AppBar from '../../components/appbar/appbar';
import Footer from '../../components/footer/footer';
import { createClient, isGoogleSession, isProfileComplete, signOutWithBackend } from '../../lib/auth';
import InputGeneral from '../../components/inputs/input_general';
import ButtonSubmit from '../../components/btn/button_submit';
import UploadImg from '../../components/upload/upload_img';
import Snackbar from '../../components/snackbar/snackbar';
import { AlertCircle, Save } from 'lucide-react';

const formatValue = (value?: string | null) => (value?.trim() ? value : '');

const BACKEND_URL = '/api';

const formatCep = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  return digits.replace(/(\d{5})(\d{1,3})?/, (_, p1, p2) => (p2 ? `${p1}-${p2}` : p1));
};

const formatBirthdate = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
};

const formatBrazilCpf = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
};

const formatBrazilPhone = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length === 0) return '';
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

const isDigits = (value: string) => /^\d+$/.test(value);
const isValidCpf = (value: string) => isDigits(value.replace(/\D/g, '')) && value.replace(/\D/g, '').length === 11;
const isValidPhone = (value: string) => isDigits(value.replace(/\D/g, '')) && value.replace(/\D/g, '').length >= 10;
const isValidCep = (value: string) => isDigits(value.replace(/\D/g, '')) && value.replace(/\D/g, '').length === 8;
const parseBirthdate = (value: string) => {
  const normalized = value.trim();
  const parts = normalized.split('/').map((part) => Number(part));
  if (parts.length !== 3) return null;
  const [day, month, year] = parts;
  if (!day || !month || !year) return null;
  const birthDate = new Date(year, month - 1, day);
  if (Number.isNaN(birthDate.getTime())) return null;
  if (birthDate.getDate() !== day || birthDate.getMonth() !== month - 1 || birthDate.getFullYear() !== year) return null;
  return birthDate;
};

const isValidBirthdate = (value: string) => {
  const birthDate = parseBirthdate(value);
  if (!birthDate) return false;
  const now = new Date();
  if (birthDate > now) return false;
  let age = now.getFullYear() - birthDate.getFullYear();
  const monthDiff = now.getMonth() - birthDate.getMonth();
  const dayDiff = now.getDate() - birthDate.getDate();
  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age -= 1;
  }
  return age >= 18;
};

type ProfileField = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
  type?: string;
  placeholder?: string;
  maxLength?: number;
  style?: CSSProperties;
  inputMode?: InputHTMLAttributes<HTMLInputElement>['inputMode'];
  pattern?: string;
};

export default function ProfilePage() {
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [showValues, setShowValues] = useState(true);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [cpf, setCpf] = useState('');
  const [phone, setPhone] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [cep, setCep] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [complement, setComplement] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('');
  const [stateUf, setStateUf] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarType, setSnackbarType] = useState<'success' | 'error'>('error');
  const [isSaving, setIsSaving] = useState(false);
  const [fieldsLocked, setFieldsLocked] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const client = createClient();
      setSupabase(client);

      client.auth.getSession().then(({ data }) => {
        const currentSession = data.session ?? null;
        setSession(currentSession);

        if (!currentSession) {
          navigate('/login', { replace: true });
        }
      });

      const { data: authListener } = client.auth.onAuthStateChange((_event, sessionData) => {
        const currentSession = sessionData ?? null;
        setSession(currentSession);

        if (!currentSession) {
          navigate('/login', { replace: true });
        }
      });

      return () => {
        authListener.subscription.unsubscribe();
      };
    } catch (err) {
      console.error('ProfilePage init error:', err);
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    document.title = 'Meu perfil | Saldo Verde';
  }, []);

  const applyProfileData = (
    source: Record<string, string | null | undefined>,
    currentSession: Session
  ) => {
    const googleSignIn = isGoogleSession(currentSession);
    setFirstName(
      googleSignIn
        ? source.first_name ?? ''
        : source.first_name ?? currentSession.user.email?.split('@')[0] ?? ''
    );
    setLastName(source.last_name ?? '');
    setCpf(formatBrazilCpf(source.cpf ?? ''));
    setPhone(formatBrazilPhone(source.phone ?? ''));
    setBirthdate(source.birthdate ?? '');
    setCep(formatCep(source.cep ?? ''));
    setStreet(source.street ?? '');
    setNumber(source.number ?? '');
    setComplement(source.complement ?? '');
    setNeighborhood(source.neighborhood ?? '');
    setCity(source.city ?? '');
    setStateUf(source.state ?? '');
    const avatar = source.avatar_url ?? source.picture ?? '';
    setAvatarUrl(avatar);
    setProfileImage(avatar);
  };

  useEffect(() => {
    if (!session) return;

    const metadata = session.user.user_metadata as Record<string, string> | undefined;
    applyProfileData(metadata ?? {}, session);

    const fetchPersistedProfile = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/profile/${session.user.id}`, {
          headers: {
            Authorization: `Bearer ${session.access_token ?? ''}`,
          },
        });

        if (!response.ok) return;

        const result = await response.json();
        const persistedProfile = result?.profile as Record<string, string> | undefined;
        if (!persistedProfile) return;

        applyProfileData(persistedProfile, session);
      } catch (err) {
        console.error('Profile fetch error:', err);
      }
    };

    void fetchPersistedProfile();
  }, [session]);

  useEffect(() => {
    const digits = cep.replace(/\D/g, '');
    if (digits.length !== 8) return;

    handleCepLookup();
  }, [cep]);

  const handleSignOut = async () => {
    if (!supabase) return;
    setIsSigningOut(true);
    try {
      await signOutWithBackend(supabase);
    } finally {
      setIsSigningOut(false);
      navigate('/login', { replace: true });
    }
  };

  const toggleShowValues = () => setShowValues((current) => !current);

  const isGoogleUser = isGoogleSession(session);

  const handleCepLookup = async () => {
    const digits = cep.replace(/\D/g, '');
    if (digits.length !== 8) {
      setSnackbarMessage('Informe um CEP válido com 8 dígitos.');
      setSnackbarOpen(true);
      return;
    }

    setSnackbarMessage('');

    try {
      const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const data = await response.json();

      if (data.erro) {
        setSnackbarMessage('CEP não encontrado.');
        setSnackbarOpen(true);
        setStreet('');
        setNeighborhood('');
        setCity('');
        setStateUf('');
        return;
      }

      setStreet(data.logradouro ?? '');
      setNeighborhood(data.bairro ?? '');
      setCity(data.localidade ?? '');
      setStateUf(data.uf ?? '');
    } catch (err) {
      console.error('CEP lookup error:', err);
      setSnackbarMessage('Não foi possível buscar o CEP. Tente novamente.');
      setSnackbarOpen(true);
    }
  };

  const fileToDataUrl = (file: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === 'string') {
        resolve(result);
      } else {
        reject(new Error('Não foi possível ler o arquivo de imagem.'));
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

  const handleProfileImageChange = (file: File | null) => {
    if (isGoogleUser) {
      setSnackbarMessage('Foto de perfil gerenciada pelo Google. Não é possível alterar aqui.');
      setSnackbarOpen(true);
      return;
    }

    setSelectedImage(file);
    setProfileImage(file ? URL.createObjectURL(file) : avatarUrl);
    if (file) {
      setSnackbarMessage('Imagem enviada. Clique em salvar.');
      setSnackbarOpen(true);
    }
  };

  const handleSavePassword = () => {
    if (isGoogleUser) {
      setSnackbarMessage('Senha gerenciada pelo Google. Não é possível alterar aqui.');
      setSnackbarOpen(true);
      return;
    }

    if (!currentPassword || !newPassword) {
      setSnackbarMessage('Preencha a senha atual e a nova senha.');
      setSnackbarOpen(true);
      return;
    }

    if (newPassword.length < 8) {
      setSnackbarMessage('A nova senha deve ter ao menos 8 caracteres.');
      setSnackbarOpen(true);
      return;
    }

    setSnackbarMessage('Alteração de senha ainda não está disponível.');
    setSnackbarOpen(true);
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabase || !session) return;

    setSnackbarMessage('');
    setSnackbarOpen(false);
    setSnackbarType('error');

    const requiredFields = [
      { value: firstName, label: 'Primeiro nome' },
      { value: lastName, label: 'Sobrenome' },
      { value: cpf, label: 'CPF' },
      { value: phone, label: 'Telefone' },
      { value: birthdate, label: 'Data de nascimento' },
      { value: cep, label: 'CEP' },
      { value: street, label: 'Rua' },
      { value: number, label: 'Número' },
      { value: complement, label: 'Complemento' },
      { value: neighborhood, label: 'Bairro' },
      { value: city, label: 'Cidade' },
      { value: stateUf, label: 'Estado' },
    ];

    const firstEmpty = requiredFields.find((field) => !field.value.trim());
    if (firstEmpty) {
      setSnackbarMessage(`Preencha o campo ${firstEmpty.label}.`);
      setSnackbarOpen(true);
      return;
    }

    if (!isValidCpf(cpf)) {
      setSnackbarMessage('Informe um CPF válido com 11 dígitos.');
      setSnackbarOpen(true);
      return;
    }

    if (!isValidPhone(phone)) {
      setSnackbarMessage('Informe um telefone válido com pelo menos 10 dígitos.');
      setSnackbarOpen(true);
      return;
    }

    if (!isValidCep(cep)) {
      setSnackbarMessage('Informe um CEP válido com 8 dígitos.');
      setSnackbarOpen(true);
      return;
    }

    if ((currentPassword || newPassword) && !(currentPassword && newPassword)) {
      setSnackbarMessage('Preencha os campos de senha atual e nova senha para alterar a senha.');
      setSnackbarOpen(true);
      return;
    }

    if (newPassword && newPassword.length < 8) {
      setSnackbarMessage('A nova senha deve ter ao menos 8 caracteres.');
      setSnackbarOpen(true);
      return;
    }

    if (!isValidBirthdate(birthdate)) {
      setSnackbarMessage('Informe uma data de nascimento válida.');
      setSnackbarOpen(true);
      return;
    }

    let avatarUrlToSave = avatarUrl;
    if (selectedImage) {
      avatarUrlToSave = await fileToDataUrl(selectedImage);
    }

    setIsSaving(true);
    setSnackbarType('error');
    setSnackbarMessage('');

    try {
      const response = await fetch(`${BACKEND_URL}/profile/${session.user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token ?? ''}`,
        },
        body: JSON.stringify({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          cpf: cpf.trim(),
          phone: phone.trim(),
          birthdate: birthdate.trim(),
          cep: cep.replace(/\D/g, '').trim(),
          street: street.trim(),
          number: number.trim(),
          complement: complement.trim(),
          neighborhood: neighborhood.trim(),
          city: city.trim(),
          state: stateUf.trim(),
          avatar_url: avatarUrlToSave,
        }),
      });

      const result = await response.json();
      console.log('Profile save response:', { status: response.status, body: result });

      if (!response.ok) {
        console.error('Profile save failed:', result);
        setSnackbarType('error');
        setSnackbarMessage(result.error || 'Não foi possível salvar o perfil.');
        setSnackbarOpen(true);
      } else {
        console.log('Profile saved successfully');
        setAvatarUrl(avatarUrlToSave);
        if (selectedImage) {
          setSelectedImage(null);
          setProfileImage(avatarUrlToSave);
        }

        setSession({
          ...session,
          user: {
            ...session.user,
            user_metadata: {
              ...session.user.user_metadata,
              first_name: firstName.trim(),
              last_name: lastName.trim(),
              cpf: cpf.trim(),
              phone: phone.trim(),
              birthdate: birthdate.trim(),
              cep: cep.replace(/\D/g, '').trim(),
              street: street.trim(),
              number: number.trim(),
              complement: complement.trim(),
              neighborhood: neighborhood.trim(),
              city: city.trim(),
              state: stateUf.trim(),
              avatar_url: avatarUrlToSave,
            },
          },
        } as Session);

        setFieldsLocked(true);
        setSnackbarType('success');
        setSnackbarMessage(result.message || 'Perfil atualizado com sucesso.');
        setSnackbarOpen(true);
      }
    } catch (err) {
      console.error('Profile save error:', err);
      setSnackbarType('error');
      setSnackbarMessage('Não foi possível salvar o perfil. Tente novamente.');
      setSnackbarOpen(true);
    } finally {
      setIsSaving(false);
    }
  };

  if (!session) {
    return null;
  }

  const email = formatValue(session.user.email);
  const profileComplete = isProfileComplete(session);

  const profileFields: ProfileField[] = [
    { label: 'Primeiro nome', value: firstName, onChange: setFirstName, maxLength: 40 },
    { label: 'Sobrenome', value: lastName, onChange: setLastName, maxLength: 40 },
    { label: 'Email', value: email, onChange: () => {}, readOnly: true, type: 'email', style: { cursor: 'not-allowed' } },
    { label: 'CPF', value: cpf, onChange: (value: string) => setCpf(formatBrazilCpf(value)), maxLength: 14, inputMode: 'numeric', pattern: '.*', readOnly: fieldsLocked, style: fieldsLocked ? { cursor: 'not-allowed' } : undefined },
    { label: 'Telefone', value: phone, onChange: (value: string) => setPhone(formatBrazilPhone(value)), maxLength: 15, inputMode: 'tel', pattern: '.*' },
    {
      label: 'Data de nascimento',
      value: birthdate,
      onChange: (value: string) => setBirthdate(formatBirthdate(value)),
      type: 'text',
      placeholder: 'DD/MM/AAAA',
      maxLength: 10,
      inputMode: 'numeric',
      pattern: '[0-9]{2}/[0-9]{2}/[0-9]{4}',
    },
    {
      label: 'CEP',
      value: cep,
      onChange: (value: string) => setCep(formatCep(value)),
      placeholder: '00000-000',
      maxLength: 9,
      inputMode: 'numeric',
      pattern: '[0-9-]*',
    },
    {
      label: 'Rua',
      value: street,
      onChange: setStreet,
      readOnly: true,
      style: { cursor: 'not-allowed' },
    },
    { label: 'Número', value: number, onChange: setNumber, maxLength: 8, inputMode: 'numeric' },
    { label: 'Complemento', value: complement, onChange: setComplement, maxLength: 40 },
    {
      label: 'Bairro',
      value: neighborhood,
      onChange: setNeighborhood,
      readOnly: true,
      style: { cursor: 'not-allowed' },
    },
    {
      label: 'Cidade',
      value: city,
      onChange: setCity,
      readOnly: true,
      style: { cursor: 'not-allowed' },
    },
    {
      label: 'Estado',
      value: stateUf,
      onChange: setStateUf,
      readOnly: true,
      style: { cursor: 'not-allowed' },
    },
  ];

  return (
    <main className="min-h-screen bg-background text-white">
      <div className="min-h-screen h-full grid w-full gap-6 lg:grid-cols-[280px_1fr] lg:items-stretch">
<Sidebar email={session.user.email ?? null} disableProtectedLinks={!isProfileComplete(session)} />

        <div className="mr-4 flex min-h-screen flex-col">
          <AppBar
            session={session}
            onSignOut={handleSignOut}
            isSigningOut={isSigningOut}
            showValues={showValues}
            onToggleValues={toggleShowValues}
          />

          <section className="flex-1 space-y-6 px-4 pb-8 sm:px-6 lg:px-0">
            <div className="space-y-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h1 className="text-3xl font-semibold text-white">Meu perfil</h1>
                  <p className="mt-2 max-w-2xl text-sm text-white/90">
                    {profileComplete
                      ? 'Aqui estão suas informações de cadastro.'
                      : 'Finalize seu cadastro para liberar o acesso completo.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-black/95 p-6 shadow-xl shadow-black/20">
              <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-white">Foto de perfil</h2>
                  <p className="text-sm text-white/70">
                    Envie uma foto em PNG ou JPEG.
                  </p>
                  <UploadImg
                    imageUrl={profileImage}
                    onChange={handleProfileImageChange}
                    acceptedTypes="image/png,image/jpeg"
                    note={isGoogleUser ? 'Foto gerenciada pelo Google' : 'Formatos aceitos: PNG, JPEG'}
                    disabled={isGoogleUser}
                  />
                  {isGoogleUser ? (
                    <p className="text-sm text-white/60">
                      A foto de perfil é fornecida pelo Google e não pode ser alterada aqui.
                    </p>
                  ) : null}
                </div>

                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-white">Editar senha</h2>
                  <p className="text-sm text-white/70">
                    Informe a senha atual e a nova senha para alterar sua senha de acesso.
                  </p>
                  <InputGeneral
                    id="current-password"
                    type="password"
                    value={currentPassword}
                    onChange={setCurrentPassword}
                    placeholder="Senha atual"
                    className="mt-0"
                    maxLength={25}
                    disabled={isGoogleUser}
                  />
                  <InputGeneral
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={setNewPassword}
                    placeholder="Nova senha"
                    className="mt-0"
                    maxLength={25}
                    disabled={isGoogleUser}
                  />
                  <ButtonSubmit
                    type="button"
                    label="Salvar nova senha"
                    icon={<Save className="h-4 w-4" />}
                    onClick={handleSavePassword}
                    fullWidth={false}
                    className="mt-3"
                    disabled={isGoogleUser}
                  />
                  {isGoogleUser ? (
                    <p className="text-sm text-white/60">
                      Senha gerenciada pelo Google e não pode ser alterada aqui.
                    </p>
                  ) : null}
                </div>
              </div>
            </div>

            <form className="rounded-xl border border-border bg-black/95 p-6 shadow-xl shadow-black/20" onSubmit={handleSave}>
              <div className="grid gap-4 sm:grid-cols-2">
                {profileFields.map((field) => {
                  const { label, value, onChange, ...inputProps } = field;
                  const fieldId = label.toLowerCase().replace(/\s+/g, '-');

                  return (
                    <div key={label} className="space-y-2">
                      <label htmlFor={fieldId} className="block text-sm font-medium text-white/70">
                        <span className="inline-flex items-center gap-2">
                          {label}
                          {(label === 'Email' || label === 'CPF') && (
                            <span className="group relative inline-flex items-center">
                              <AlertCircle className="h-4 w-4 text-white/50" />
                              <span className="invisible absolute left-1/2 top-full z-10 -translate-x-1/2 whitespace-nowrap rounded bg-white px-2 py-1 text-xs text-black opacity-0 shadow-xl shadow-black/10 transition-all duration-150 group-hover:visible group-hover:opacity-100">
                                Não é possível alterar {label.toLowerCase()}. Entre em contato com o suporte.
                              </span>
                            </span>
                          )}
                        </span>
                      </label>
                      <InputGeneral
                        id={fieldId}
                        type={field.type ?? 'text'}
                        value={value}
                        onChange={onChange}
                        placeholder={label}
                        className={`placeholder:text-white/50 ${field.readOnly && fieldsLocked ? 'cursor-not-allowed' : ''}`}
                        {...inputProps}
                      />
                      {label === 'CEP' ? (
                        <p className="text-xs text-white/60">
                          Digite o CEP completo.
                        </p>
                      ) : null}
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <ButtonSubmit
                  type="submit"
                  label={isSaving ? 'Salvando...' : 'Salvar'}
                  icon={<Save className="h-4 w-4" />}
                  loading={isSaving}
                  fullWidth={false}
                />
              </div>
            </form>
          </section>

          <Footer />
        </div>
      </div>

      <Snackbar
        open={snackbarOpen}
        message={snackbarMessage}
        type={snackbarType}
        onClose={() => {
          setSnackbarOpen(false);
          setSnackbarType('error');
        }}
      />
    </main>
  );
}
