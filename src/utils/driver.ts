export const driver = {
    isOnline: true,
    modal: {
        modalName: null,
        handlers: {
            activate: (_name: any, _data: any) => {
                // Your modal activation logic
            },
            finish: () => {
                // Your modal finish logic
            },
            cancel: () => {
                // Your modal cancel logic
            }
        }
    },
    session: {
        handlers: {
            logIn: async (_keypair: any, _options: any) => {
                // Your login logic
            },
            handleLogout: () => {
                // Your logout logic
            }
        },
        account: {
            refresh: () => {
                // Your account refresh logic
            },
            updateOffers: () => {
                // Your offers update logic
            }
        }
    },
    toastService: {
        error: (_title: any, _message: any) => {
            // Your error toast logic
        }
    }
};
