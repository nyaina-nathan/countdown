import { Mode } from './types';

interface AuthModeSwitchProps {
    mode: Mode;
    onSwitch: (mode: Mode) => void;
}

export function AuthModeSwitch({ mode, onSwitch }: AuthModeSwitchProps) {
    const isRegister = mode === 'register';

    return (
        <p className="mt-8 text-center font-mono text-xs uppercase tracking-widest text-[#6B7280]">
            {isRegister ? (
                <>
                    Already have an account?{' '}
                    <button
                        type="button"
                        onClick={() => onSwitch('login')}
                        className="link-sega"
                    >
                        Log in
                    </button>
                </>
            ) : (
                <>
                    Don&apos;t have an account?{' '}
                    <button
                        type="button"
                        onClick={() => onSwitch('register')}
                        className="link-sega"
                    >
                        Sign up
                    </button>
                </>
            )}
        </p>
    );
}
