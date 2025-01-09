import { useQuery } from "react-query";
import { firestore } from "../utils/firebase";
import { collection, getDocs } from "firebase/firestore";
import { Task } from "../types";


const fetchTasks = async (): Promise<Task[]> => {
  // Use the new Firebase v9 syntax for querying Firestore
  const querySnapshot = await getDocs(collection(firestore, "tasks"));
  
 
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Task);
};


export const useTasks = () => {
  return useQuery("tasks", fetchTasks); // Fetch tasks using react-query
};
