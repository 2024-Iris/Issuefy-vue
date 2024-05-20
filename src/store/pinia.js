import {defineStore} from 'pinia';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        accessToken: null,
        refreshToken: null,
        userName: null,
        avatarURL: null
    }),
    getters: {
        isLoggedIn: (state) => !!state.accessToken,
    },
    actions: {
        setCredentials(accessToken, refreshToken, userName, avatarURL) {
            this.$patch({
                accessToken,
                refreshToken,
                userName,
                avatarURL
            });
        },
        clearCredentials() {
            this.$patch({
                accessToken: null,
                refreshToken: null,
                userName: null,
                avatarURL: null
            });
        }
    }
});

export const useStarStore = defineStore('star', {
    state: () => ({
        repositories: [
            {
                id: 1,
                name: "elasticsearch",
                org: ["elastic"],
                updatedAt: "2024-05-13",
                star: true
            },
            {
                id: 2,
                name: "spring-boot",
                org: ["spring-project"],
                updatedAt: "2024-05-12",
                star: false
            },
            {
                id: 3,
                name: "vue3",
                org: ["vue-project"],
                updatedAt: "2024-05-14",
                star: true
            }
        ],
        issues: [
            {
                id: 1,
                title: "첫번째 이슈 제목",
                tags: ["bug", "performance"],
                status: "open",
                updatedAt: "2024-05-13",
                star: true
            },
            {
                id: 2,
                title: "두번째 이슈 제목",
                tags: ["good first issue"],
                status: "closed",
                updatedAt: "2024-05-12",
                star: false
            },
            {
                id: 3,
                title: "세번째 이슈 제목",
                tags: ["enhancement", "auth"],
                status: "open",
                updatedAt: "2024-05-14",
                star: true
            }
        ]
    }),
    actions: {
        toggleRepositoryStar(id) {
            const repo = this.repositories.find(repository => repository.id === id)
            if (repo) {
                repo.star = !repo.star
            }
        },
        toggleIssueStar(id) {
            const issue = this.issues.find(issue => issue.id === id)
            if (issue) {
                issue.star = !issue.star
            }
        }
    }
});