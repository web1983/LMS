import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react"; // import Loader2
import { useLoginUserMutation, useRegisterUserMutation } from "@/features/api/authApi";
import { toast } from "sonner";
import { useNavigate, Link } from "react-router-dom";


const Login = () => {
  const [signupInput, setSignupInput] = useState({ 
    name: "", 
    email: "", 
    password: "", 
    school: "",
    studentClass: "",
    level: ""
  });
  const [loginInput, setLoginInput] = useState({ email: "", password: "" });

  const [registerUser, { data: registerData, error: registerError, isLoading: registerIsLoading, isSuccess: registerIsSuccess }] =
    useRegisterUserMutation();
  const [loginUser, { data: loginData, error: loginError, isLoading: loginIsLoading, isSuccess: loginIsSuccess }] =
    useLoginUserMutation();
    const navigate = useNavigate();

  const changeInputHandler = (e, type) => {
    const { name, value } = e.target;

    if (type === "signup") {
      setSignupInput({ ...signupInput, [name]: value });
    } else {
      setLoginInput({ ...loginInput, [name]: value });
    }
  };

  const handleRegistration = async (type) => {   // async added
    let inputData = type === "signup" ? signupInput : loginInput;
    
    // If signup, validate and construct category from studentClass and level
    if (type === "signup") {
      if (!signupInput.studentClass || !signupInput.level) {
        toast.error("Please select your grade and level");
        return;
      }
      
      const categoryMap = {
        "3-5_basic": "grade_3_5_basic",
        "3-5_advance": "grade_3_5_advance",
        "6-8_basic": "grade_6_8_basic",
        "6-8_advance": "grade_6_8_advance",
        "9-12_basic": "grade_9_12_basic",
        "9-12_advance": "grade_9_12_advance"
      };
      
      const categoryKey = `${signupInput.studentClass}_${signupInput.level.toLowerCase()}`;
      const category = categoryMap[categoryKey];
      
      inputData = {
        name: signupInput.name,
        email: signupInput.email,
        password: signupInput.password,
        school: signupInput.school,
        category: category
      };
    }
    
    console.log(inputData);
    const action = type === "signup" ? registerUser : loginUser;
    await action(inputData);  // works fine now
  };


useEffect(() => {
  if (registerIsSuccess && registerData) {
    toast.success(registerData.message || "Signup Successful. Logging you in...");
    // Automatically log in the user after successful signup
    loginUser({ email: signupInput.email, password: signupInput.password });
  }
  if (registerError) {
    toast.error(registerError?.data?.message || "Signup Failed");
  }

  if (loginIsSuccess && loginData) {
    toast.success(loginData.message || "Login Successful.");
    navigate("/");
  }
  if (loginError) {
    toast.error(loginError.data.message || "Login Failed");
  }
}, [registerIsSuccess, registerError, registerData, loginIsSuccess, loginError, loginData]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="w-full max-w-md">
        <Tabs defaultValue="login" className="bg-white rounded-xl shadow-lg overflow-hidden pt-4 px-3">
          <TabsList className="flex justify-center bg-gray-50 p-1 rounded-t-xl">
            <TabsTrigger
              value="signup"
              className="flex-1 text-center py-3 px-4 font-medium rounded-lg data-[state=active]:bg-white data-[state=active]:text-black transition-all"
            >
              Signup
            </TabsTrigger>
            <TabsTrigger
              value="login"
              className="flex-1 text-center py-3 px-4 font-medium rounded-lg data-[state=active]:bg-white data-[state=active]:text-black transition-all"
            >
              Login
            </TabsTrigger>
          </TabsList>

          {/* Signup Tab */}
          <TabsContent value="signup" className="p-6">
            <Card className="shadow-none border-0">
              <CardHeader className="mb-4 text-center">
                <CardTitle className="text-2xl font-bold">Signup</CardTitle>
                <CardDescription>Create a new account and click signup when you're done.</CardDescription>
              </CardHeader>

              <CardContent className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="signup-name">Name</Label>
                  <Input
                    onChange={(e) => changeInputHandler(e, "signup")}
                    value={signupInput.name}
                    name="name"
                    type="text"
                    placeholder="eg. Akshay"
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    onChange={(e) => changeInputHandler(e, "signup")}
                    value={signupInput.email}
                    name="email"
                    type="email"
                    placeholder="eg. akshay@lms.com"
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="signup-school">School Name</Label>
                  <Input
                    onChange={(e) => changeInputHandler(e, "signup")}
                    value={signupInput.school}
                    name="school"
                    type="text"
                    placeholder="eg. ABC High School"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="signup-class">Student Class</Label>
                  <Select 
                    value={signupInput.studentClass} 
                    onValueChange={(value) => setSignupInput({ ...signupInput, studentClass: value })}
                    className="bg-white"
                  >
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Select your grade" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="3-5">Grade 3 to 5</SelectItem>
                      <SelectItem value="6-8">Grade 6 to 8</SelectItem>
                      <SelectItem value="9-12">Grade 9 to 12</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="signup-level">Level</Label>
                  <Select 
                    value={signupInput.level} 
                    onValueChange={(value) => setSignupInput({ ...signupInput, level: value })}
                  >
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="Basic">Basic</SelectItem>
                      <SelectItem value="Advance">Advance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    onChange={(e) => changeInputHandler(e, "signup")}
                    value={signupInput.password}
                    name="password"
                    type="password"
                    placeholder="eg. xyz"
                    required
                  />
                </div>
              </CardContent>

              <CardFooter className="mt-4">
                <Button
                  disabled={registerIsLoading}
                  onClick={() => handleRegistration("signup")}
                  className="w-full bg-black text-white hover:bg-gray-800 transition-colors"
                >
                  {registerIsLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait
                    </>
                  ) : (
                    "Signup"
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Login Tab */}
          <TabsContent value="login" className="p-6">
            <Card className="shadow-none border-0">
              <CardHeader className="mb-4 text-center">
                <CardTitle className="text-2xl font-bold">Login</CardTitle>
                <CardDescription>Login with your email and password.</CardDescription>
              </CardHeader>

              <CardContent className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    onChange={(e) => changeInputHandler(e, "login")}
                    value={loginInput.email}
                    name="email"
                    type="email"
                    placeholder="eg. akshay@lms.com"
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="login-password">Password</Label>
                    <Link 
                      to="/forgot-password" 
                      className="text-sm text-blue hover:text-black-200 hover:underline font-medium"
                    >
                      Forgot Password?
                    </Link>
                  </div>
                  <Input
                    onChange={(e) => changeInputHandler(e, "login")}
                    value={loginInput.password}
                    name="password"
                    type="password"
                    placeholder="eg. xyz"
                    required
                  />
                </div>
              </CardContent>

              <CardFooter className="mt-4">
                <Button
                  disabled={loginIsLoading}
                  onClick={() => handleRegistration("login")}
                  className="w-full bg-black text-white hover:bg-gray-800 transition-colors"
                >
                  {loginIsLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait
                    </>
                  ) : (
                    "Login"
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Login;
