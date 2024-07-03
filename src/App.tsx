// import { Authenticator } from '@aws-amplify/ui-react'
// import '@aws-amplify/ui-react/styles.css'
// import { useEffect, useState } from "react";
// import type { Schema } from "../amplify/data/resource";
// import { generateClient } from "aws-amplify/data";
// import { withInAppMessaging } from '@aws-amplify/ui-react-notifications';


// const client = generateClient<Schema>();

// function App() {
//   const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);

//   function deleteTodo(id: string) {
//     client.models.Todo.delete({ id })
//   }

//   useEffect(() => {
//     client.models.Todo.observeQuery().subscribe({
//       next: (data) => setTodos([...data.items]),
//     });
//   }, []);

//   function createTodo() {
//     const dateTime = new Date()
//     client.models.Todo.create({ content: window.prompt("Todo content"), responseTime: dateTime.toISOString(),
//     accountRepresentativeId: "1", });
//   }

//   return (
//     <Authenticator>
//       {({ signOut, user }) => (
//       <main>
//       <h1>{user?.signInDetails?.loginId}'s todos</h1>
//       <button onClick={createTodo}>+ new</button>
//       <ul>
//         {todos.map((todo) => (
//           <li onClick={() => deleteTodo(todo.id)} key={todo.id}>{todo.content}</li>
//         ))}
//       </ul>
//       <div>
//         🥳 App successfully hosted. Try creating a new todo.
//         <br />
//         <a href="https://docs.amplify.aws/react/start/quickstart/#make-frontend-updates">
//           Review next step of this tutorial.
//         </a>
//       </div>
//       <button onClick={signOut}>Sign out</button>
//     </main>
//     )}
//     </Authenticator> 
//   );
// }

// export default withInAppMessaging(App);
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import { Amplify } from 'aws-amplify';
// import { withInAppMessaging } from '@aws-amplify/ui-react-notifications';
import { dispatchEvent, syncMessages } from 'aws-amplify/in-app-messaging';
import '@aws-amplify/ui-react/styles.css'
import { initializeInAppMessaging } from 'aws-amplify/in-app-messaging';
import outputs from '../amplify_outputs.json';


Amplify.configure(outputs);

initializeInAppMessaging();


// await syncMessages();


const myFirstEvent = { name: 'my_first_event' };

const client = generateClient<Schema>();

const App = () => {
  const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);

  useEffect(() => {
    client.models.Todo.observeQuery().subscribe({
      next: (data) => setTodos([...data.items]),
    });
    syncMessages();
  }, []);

  function createTodo() {
        const dateTime = new Date()
        client.models.Todo.create({ content: window.prompt("Todo content"), responseTime: dateTime.toISOString(),
        accountRepresentativeId: "1", });
      }
    
  function deleteTodo(id: string) {
    client.models.Todo.delete({ id })
  }

  return (
    <Authenticator>
      {({ signOut, user }) => (
        <main>
          <h1>📘 My todos</h1>
          <h3>{user?.signInDetails?.loginId}'s todos</h3>
          {/* <button onClick={() => {
            record(myFirstEvent);
          }}>
            Record Analytics Event
          </button> */}
          <h3></h3>
          <button onClick ={() => {
            createTodo();
            dispatchEvent(myFirstEvent);
            
          }}>
            +new task
          </button>
          {/* <button onClick={createTodo}>+new</button> */}
          {/* <button onClick={() => {
            createTodo 
            record({
            name: 'first_event',
            attributes: { color: 'red'},
            metrics: { quantity: 10 }
            });
            }}
            >
          + new
          </button>*/}
          <ul>
            {todos.map(todo => <li
              onClick={() => deleteTodo(todo.id)}
              key={todo.id}>
              {todo.content}
            </li>)}
          </ul>
          <div>
            🥳 App successfully hosted. Try creating a new todo.
            <br />
            <a href="https://docs.amplify.aws/react/start/quickstart/">Review next step of this tutorial.</a>
          </div>
          <button onClick={signOut}>Sign out</button>
        </main>
      )}
    </Authenticator>
  )
};



export default App;