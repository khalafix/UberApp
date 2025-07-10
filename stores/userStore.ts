import { makeAutoObservable, reaction, runInAction } from "mobx";
import { ZodIssue } from "zod";

import agent from "@/app/api/agent";
import { ActionResult } from "@/types";
import { User, UserIdAndName } from "@/types/user";
import { LoginSchema, RegisterSchema, RegisterSchemaForEmail } from "../lib/schemas/loginSchema";
import { saveToken } from "../lib/schemas/utils";

export default class UserStore {
  user: User | null = null;
  error: ZodIssue[] | string | null = null;
  token: string | null | undefined = null;
  appLoaded: boolean = false;
  language: string = "en";

  usersIdName: UserIdAndName[] | undefined = [];
  editUser: UserIdAndName | null = null;

  constructor() {
    makeAutoObservable(this);

    reaction(
      () => this.token,
      (token) => {
        return saveToken(token);
      }
    );
  }

  get isLoggedIn() {
    return !!this.user;
  }

  login = async (creds: LoginSchema): Promise<ActionResult<string>> => {
    try {
      const user = await agent.Account.login(creds);

      // reslove Mobx strict mode
      runInAction(() => {
        console.log("userFRomStore",user);
        this.setToken(user.token);
        this.user = user;
      });

      return { status: "success", data: "Logged in" };
    } catch (error) {
      return { status: "error", error: error as string };
    }
  };

  getUser = async () => {
    try {
      const user = await agent.Account.current();

      // reslove Mobx strict mode
      runInAction(() => (this.user = user));

      return { status: "success", data: "We have got current user" };
    } catch (error) {
      return { status: "error", error: error as string };
    }
  };

  register = async (creds: RegisterSchema): Promise<ActionResult<string>> => {
    try {
      await agent.Account.register(creds);

      // reslove Mobx strict mode
      // runInAction(() => {
      //   this.setToken(user.token);
      //   this.user = user;
      // });

      return { status: "success", data: "User Created Succesfully " };
    } catch (error) {
      return { status: "error", error: error as string };
    }
  };

  registerWithEmail = async (creds: RegisterSchemaForEmail): Promise<ActionResult<string>> => {
    try {
      await agent.Account.registerWithEmail(creds);

      // reslove Mobx strict mode
      // runInAction(() => {
      //   this.setToken(user.token);
      //   this.user = user;
      // });

      return { status: "success", data: "User Created Succesfully " };
    } catch (error) {
      return { status: "error", error: error as string };
    }
  };


  getUSer = async (id: string) => {
    try {
      const result = await agent.Account.getById(id);
      runInAction(() => {
        this.editUser = result;
      });
      return result;
    } catch (error) {
      console.error("Error loading service:", error);
    }
  };

  logout = async () => {
    runInAction(() => {
      this.setToken(null);
      this.user = null;
    });
  };

  setAppLoaded = async () => {
    this.appLoaded = true;
  };

  setLanguage = async (lang: string) => {
    this.language = lang;
  };

  setServerError(error: ZodIssue[] | string) {
    this.error = error;
  }

setToken = async (token: string | null | undefined) => {
    await saveToken(token);
    runInAction(() => {
      this.token = token;
    });
  };

  checkUserExistsByEmail = async (email: string): Promise<boolean> => {
  try {
    const exists = await agent.Account.checkUserExistsByEmail(email); // create this endpoint
    return exists;
  } catch (error) {
    console.error("Error checking user existence", error);
    return false;
  }
};



  hasRole = (role: string): boolean => {
    return this.user?.roles && Array.isArray(this.user.roles)
      ? this.user.roles.includes(role)
      : false;
  };

  isAdmin = () => {
    return this.hasRole("ADMIN");
  };
  isCustomer = () => {
    return this.hasRole("CUSTOMER");
  };

  isUser = (): boolean => {
    return this.hasRole("USER");
  };

}
