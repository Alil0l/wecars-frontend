# frappe-react-sdk

React hooks library for a [Frappe Framework](https://frappeframework.com) backend.

<br />
<p align="center">
  <a href="https://github.com/nikkothari22/frappe-react-sdk"><img src="https://img.shields.io/maintenance/yes/2024?style=flat-square" /></a>
  <a href="https://github.com/nikkothari22/frappe-react-sdk"><img src="https://img.shields.io/github/license/nikkothari22/frappe-react-sdk?style=flat-square" /></a>
  <a href="https://www.npmjs.com/package/frappe-react-sdk"><img src="https://img.shields.io/npm/v/frappe-react-sdk?style=flat-square" /></a>
    <a href="https://www.npmjs.com/package/frappe-react-sdk"><img src="https://img.shields.io/npm/dw/frappe-react-sdk?style=flat-square" /></a>
</p>

## Features

The library currently supports the following features:

- 🔐 Authentication - login with username and password (cookie based) + token based authentication, logout and maintain user state
- 🗄 Database - Hooks to get document, get list of documents, get count, create, update and delete documents
- 📄 File upload - Hook to upload a file to the Frappe filesystem. Maintains loading, progress and error states.
- 🤙🏻 API calls - Hooks to make API calls to your whitelisted backend functions and maintain state
- 🔍 Search - Hook to search documents in your database (with debouncing ✨)

We plan to add the following features in the future:

- Support for other common functions like `exists` in the database.

The library uses [frappe-js-sdk](https://github.com/The-Commit-Company/frappe-js-sdk) and [SWR](https://swr.vercel.app) under the hood to make API calls to your Frappe backend.

<br/>

## SWR

SWR uses a cache invalidation strategy and also updates the data constantly and automatically (in the background). This allows the UI to always be fast and reactive.
The hooks in the library use the default configuration for useSWR but you will be able to overwrite the configuration of useSWR. Please refer to the [useSWR API Options](https://swr.vercel.app/docs/options)

<br/>

## Looking for a Frappe frontend library for other Javascript frameworks?

You can use [frappe-js-sdk](https://github.com/nikkothari22/frappe-js-sdk) to interface your frontend web app with Frappe.

<br/>

## Maintainers

| Maintainer     | GitHub                                          | Social                                                       |
| -------------- | ----------------------------------------------- | ------------------------------------------------------------ |
| Nikhil Kothari | [nikkothari22](https://github.com/nikkothari22) | [@nik_kothari22](https://twitter.com/nik_kothari22)          |
| Janhvi Patil   | [janhvipatil](https://github.com/janhvipatil)   | [@janhvipatil\_](https://twitter.com/janhvipatil_)           |
| Sumit Jain     | [sumitjain236](https://github.com/sumitjain236) | [LinkedIn](https://www.linkedin.com/in/sumit-jain-66bb5719a) |

<br/>

## Installation

```bash
npm install frappe-react-sdk
```

or

```bash
yarn add frappe-react-sdk
```

**Note** - All examples below are in Typescript. If you want to use it with Javascript, just ignore the type generics like `<T>` in the examples below.

<br/>

## Initialising the library

To get started, initialise the library by wrapping your App with the `FrappeProvider`.
You can optionally provide the URL of your Frappe server if the web app is not hosted on the same URL.

In `App.tsx` or `App.jsx`:

```jsx
import { FrappeProvider } from "frappe-react-sdk";

function App() {
    /** The URL is an optional parameter. Only use it if the Frappe server is hosted on a separate URL **/
  return (
    <FrappeProvider url='https://my-frappe-server.frappe.cloud'>
    {/** Your other app components **/}
    </FrappeProvider>
  )

```

In case you want to use the library with token based authentication (OAuth bearer tokens or API key/secret pairs), you can initialise the library like this:

```jsx
import { FrappeProvider } from 'frappe-react-sdk';

function App() {

  /** The URL is an optional parameter. Only use it if the Frappe server is hosted on a separate URL **/
  return (
    <FrappeProvider url='https://my-frappe-server.frappe.cloud' tokenParams={
        useToken: true,
        // Pass a custom function that returns the token as a string - this could be fetched from LocalStorage or auth providers like Firebase, Auth0 etc.
        token: getTokenFromLocalStorage(),
        // This can be "Bearer" or "token"
        type: "Bearer"
    } >
      {/** Your other app components **/}
    </FrappeProvider>
  );
}
```

<br/>

## Authentication

The `useFrappeAuth` hook allows you to maintain the state of the current user, as well as login and logout the current user.

The hook uses `useSWR` under the hood to make the `get_current_user` API call - you can also pass in parameters to configure the behaviour of the useSWR hook.

```jsx
export const MyAuthComponent = () => {
  const {
    currentUser,
    isValidating,
    isLoading,
    login,
    logout,
    error,
    updateCurrentUser,
    getUserCookie,
  } = useFrappeAuth();

  if (isLoading) return <div>loading...</div>;

  // render user
  return (
    <div>
      {currentUser}
      <button onClick={() => login('administrator', 'admin')}>Login</button>
      <button onClick={logout}>Logout</button>
      <button onClick={updateCurrentUser}>Fetch current user</button>
    </div>
  );
};
```

The hook will not make an API call if no cookie is found. If there is a cookie, it will call the `frappe.auth.get_logged_user` method.
The hook will throw an error if the API call to `frappe.auth.get_logged_user` fails (network issue etc) or if the user is logged out (403 Forbidden). Handle errors accordingly and route the user to your login page if the error is because the user is not logged in.

The `getUserCookie` method can be used to reset the auth state if you encounter an authorization error in any other API call. This will then reset the `currentUser` to null.

<br/>

## Database

<br/>

### Fetch a document

The `useFrappeGetDoc` hook can be used to fetch a document from the database. The hook uses `useSWR` under the hood and it's configuration can be passed to it.

Parameters:

| No. | Variable  | type               | Required | Description               |
| --- | --------- | ------------------ | -------- | ------------------------- |
| 1.  | `doctype` | `string`           | ✅       | Name of the doctype       |
| 2.  | `docname` | `string`           | ✅       | Name of the document      |
| 3.  | `options` | `SWRConfiguration` | -        | SWR Configuration Options |

```tsx
export const MyDocumentData = () => {
  const { data, error, isValidating, mutate } = useFrappeGetDoc<T>(
    'User',
    'Administrator',
    {
      /** SWR Configuration Options - Optional **/
    }
  );

  if (isValidating) {
    return <>Loading</>;
  }
  if (error) {
    return <>{JSON.stringify(error)}</>;
  }
  if (data) {
    return (
      <p>
        {JSON.stringify(data)}
        <button onClick={() => mutate()}>Reload</button>
      </p>
    );
  }
  return null;
};
```

<hr/>
<br/>

### Fetch list of documents

The `useFrappeGetDocList` hook can be used to fetch a list of documents from the database.

Parameters:

| No. | Variable  | type               | Required | Description                                                                                         |
| --- | --------- | ------------------ | -------- | --------------------------------------------------------------------------------------------------- |
| 1.  | `doctype` | `string`           | ✅       | Name of the doctype                                                                                 |
| 2.  | `args`    | `GetDocListArgs`   | -        | optional parameter (object) to sort, filter, paginate and select the fields that you want to fetch. |
| 3.  | `options` | `SWRConfiguration` | -        | SWR Configuration Options                                                                           |

```tsx
export const MyDocumentList = () => {
  const { data, error, isValidating, mutate } = useFrappeGetDocList<T>(
    'DocType',
    {
      /** Fields to be fetched - Optional */
      fields: ['name', 'creation'],
      /** Filters to be applied - SQL AND operation */
      filters: [['creation', '>', '2021-10-09']],
      /** Filters to be applied - SQL OR operation */
      orFilters: [],
      /** Fetch from nth document in filtered and sorted list. Used for pagination  */
      limit_start: 5,
      /** Number of documents to be fetched. Default is 20  */
      limit: 10,
      /** Sort results by field and order  */
      orderBy: {
        field: 'creation',
        order: 'desc',
      },
      /** Fetch documents as a dictionary */
      asDict: false,
    },
    {
      /** SWR Configuration Options - Optional **/
    }
  );

  if (isValidating) {
    return <>Loading</>;
  }
  if (error) {
    return <>{JSON.stringify(error)}</>;
  }
  if (data) {
    return (
      <p>
        {JSON.stringify(data)}
        <button onClick={() => mutate()}>Reload</button>
      </p>
    );
  }
  return null;
};
```

Type declarations are available for the second argument and will be shown to you in your code editor.

#### Examples

##### Fetch 20 items without optional parameters

In this case, only the `name` attribute will be fetched.

```tsx
export const MyDocumentList = () => {
  const { data, error, isValidating } = useFrappeGetDocList<string>('User');

  if (isValidating) {
    return <>Loading</>;
  }
  if (error) {
    return <>{JSON.stringify(error)}</>;
  }
  if (data) {
    return (
      <ul>
        {data.map((username) => (
          <li>{username}</li>
        ))}
      </ul>
    );
  }
  return null;
};
```

##### Fetch usernames and emails with pagination

```tsx
type UserItem = {
    name: string,
    email: string
}
export const MyDocumentList = () => {
    const [pageIndex, setPageIndex] = useState(0)
    const { data, error, isValidating, isLoading } = useFrappeGetDocList<UserItem>("User" , {
        fields: ["name", "email"],
        limit_start: pageIndex,
        /** Number of documents to be fetched. Default is 20  */
        limit: 10,
        /** Sort results by field and order  */
        orderBy: {
            field: "creation",
            order: 'desc'
        }
    });

    if (isLoading) {
        return <>Loading</>
    }
    if (error) {
        return <>{JSON.stringify(error)}</>
    }
    if (data) {
        return <div>
            <ul>
            {
                data.map({name, email} => <li>{name} - {email}</li>)
            }
            </ul>
            <button onClick={() => setPageIndex(pageIndex + 10)}>Next page</button>
        </div>
    }
    return null
}
```

<br/>
<hr/>
<br/>

### Fetch number of documents

Parameters:

| No. | Variable  | type               | Required | Description                                                    |
| --- | --------- | ------------------ | -------- | -------------------------------------------------------------- |
| 1.  | `doctype` | `string`           | ✅       | Name of the doctype                                            |
| 2.  | `filters` | `Filter[]`         | -        | optional parameter to filter the result                        |
| 3.  | `cache`   | `boolean`          | -        | Whether to cache the value on the server - default: `false`    |
| 3.  | `debug`   | `boolean`          | -        | Whether to log debug messages on the server - default: `false` |
| 3.  | `config`  | `SWRConfiguration` | -        | SWR Configuration Options                                      |

```tsx
export const DocumentCount = () => {
  const { data, error, isValidating, mutate } = useFrappeGetDocCount(
    'User',
    /** Filters **/
    [['enabled', '=', true]],
    /** Cache the result on server **/
    false,
    /** Print debug logs on server **/
    false,
    {
      /** SWR Configuration Options - Optional **/
    }
  );

  if (isValidating) {
    return <>Loading</>;
  }
  if (error) {
    return <>{JSON.stringify(error)}</>;
  }
  if (data) {
    return (
      <p>
        {data} enabled users
        <Button onClick={() => mutate()}>Reload</Button>
      </p>
    );
  }
  return null;
};
```

#### Examples

##### Fetch total number of documents

```tsx
export const DocumentCount = () => {
  const { data, error, isValidating } = useFrappeGetDocCount('User');

  if (isValidating) {
    return <>Loading</>;
  }
  if (error) {
    return <>{JSON.stringify(error)}</>;
  }
  if (data) {
    return <p>{data} total users</p>;
  }
  return null;
};
```

##### Fetch number of documents with filters

```tsx
export const DocumentCount = () => {
  const { data, error, isLoading } = useFrappeGetDocCount('User', [
    ['enabled', '=', true],
  ]);

  if (isLoading) {
    return <>Loading</>;
  }
  if (error) {
    return <>{JSON.stringify(error)}</>;
  }
  if (data) {
    return <p>{data} enabled users</p>;
  }
  return null;
};
```

<br/>
<hr/>
<br/>

### Create a document

To create a new document, pass the name of the DocType and the fields to `createDoc`.

```js
db.createDoc('My Custom DocType', {
  name: 'Test',
  test_field: 'This is a test field',
})
  .then((doc) => console.log(doc))
  .catch((error) => console.error(error));
```

<br/>
<hr/>
<br/>

### Update a document

To update an existing document, pass the name of the DocType, name of the document and the fields to be updated to `updateDoc`.

```js
db.updateDoc('My Custom DocType', 'Test', {
  test_field: 'This is an updated test field.',
})
  .then((doc) => console.log(doc))
  .catch((error) => console.error(error));
```

<br/>
<hr/>
<br/>

### Delete a document

To create a new document, pass the name of the DocType and the name of the document to be deleted to `deleteDoc`.

```js
db.deleteDoc('My Custom DocType', 'Test')
  .then((response) => console.log(response.message)) // Message will be "ok"
  .catch((error) => console.error(error));
```

<br/>

## API Calls

<br/>

### useFrappeGetCall
```jsx
export const MyDocumentGetCall = () => {
  const { data, error, isLoading, isValidating, mutate } = useFrappeGetCall(
    /** method **/
    'frappe.client.get_value',
    /** params **/
    {
      doctype: 'User',
      fieldname: 'interest',
      filters: {
        name: 'Administrator',
      },
    }
    /** SWR Key - Optional **/
    /** SWR Configuration Options - Optional **/
  );

  if (isLoading) {
    return <>Loading</>;
  }
  if (error) {
    return <>{JSON.stringify(error)}</>;
  }
  if (data) {
    return <p>{data.message}</p>;
  }
  return null;
};
```

### useFrappePostCall
```jsx
export const MyDocumentPostCall = () => {
  const { call, result, loading, error, isCompleted, reset } = useFrappePostCall(
    /** method **/
    'frappe.client.set_value'
  );

  const generateRandomNumber = () => {
    call({
      //** params **/
      doctype: 'User',
      name: 'Administrator',
      fieldname: 'interest',
      value: Math.random(),
    });
  };

  const resetCall = () => {
    reset();
  };

  if (loading) {
    return <>Loading</>;
  }
  if (error) {
    return <>{JSON.stringify(error)}</>;
  }
  if (result) {
    return <p>{result}</p>;
  }
  return null;
};
```

### useFrappePutCall
```jsx
export const MyDocumentPutCall = () => {
  const { call, result, loading, error, reset, isCompleted } = useFrappePutCall(
    /** method **/
    'frappe.client.set_value'
  );

  const generateRandomNumber = () => {
    call({
      //** params **/
      doctype: 'User',
      name: 'Administrator',
      fieldname: 'interest',
      value: Math.random(),
    });
  };

  const resetCall = () => {
    reset();
  };

  if (loading) {
    return <>Loading</>;
  }
  if (error) {
    return <>{JSON.stringify(error)}</>;
  }
  if (result) {
    return <p>{result}</p>;
  }
  return null;
};
```

### useFrappeDeleteCall
```jsx
export const MyDocumentDeleteCall = () => {
  const { call, result, loading, error, isCompleted, reset } = useFrappeDeleteCall(
    /** method **/
    'frappe.client.delete'
  );

  const deleteDoc = () => {
    call({
      //** params **/
      doctype: 'User',
      name: 'Administrator',
    });
  };

  const resetCall = () => {
    reset();
  };

  if (loading) {
    return <>Loading</>;
  }
  if (error) {
    return <>{JSON.stringify(error)}</>;
  }
  if (result) {
    return <p>{result}</p>;
  }
  return null;
};
```

<br/>

## File Uploads

### useFrappeFileUpload

This hook allows you to upload files to Frappe. It returns an object with the following properties:

| No. | Properties | type | Description |
| --- | ---------- | -------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| 1. | `upload` | `(file: File, args: FileArgs) => Promise<FrappeFileUploadResponse>` | Function to upload the file |
| 2. | `progress` | `number` | Upload Progress in % - rounded off |
| 3. | `loading` | `boolean` | Will be true when the file is being uploaded |
| 4. | `error` | `Error \| null` | Error object returned from API call |
| 5. | `isCompleted`| `boolean` | Will be true if file upload is successful. Else false. |
| 6. | `reset` | `() => void` | Function to reset the state of the hook. |

The `upload` function takes 2 arguments:

1. `file` - The file to be uploaded
2. `args` - An object with the following properties:

| No. | Argument    | type      | Description                                    |
| --- | ----------- | --------- | ---------------------------------------------- |
| 1.  | `isPrivate` | `boolean` | If the file access is private then set to TRUE |
| 2.  | `folder`    | `string`  | Folder the file exists in                      |
| 3.  | `file_url`  | `string`  | File URL                                       |
| 4.  | `doctype`   | `string`  | Doctype associated with the file               |
| 5.  | `docname`   | `string`  | Docname/ document associated with the file     |
| 6.  | `fieldname` | `string`  | Fieldname to be linked in the document         |

```tsx
export const FileUpload = () => {

  const { upload, error, loading, progress, isCompleted, reset } = useFrappeFileUpload();

  const [file, setFile] = useState<File>();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files[0];
    if (file) {
      upload(file, {
        isPrivate: true,
        doctype: "User",
        docname: "john@cena.com",
        fieldname: "user_image",
      })
      .then((r) => {
        console.log(r.file_url);
        // Reset the state of the hook
        reset();
      });
    }
  };

  return (
    <div>
      <input type="file" onChange={(e) => setFile(e)} />
      <button onClick={handleUpload}>Upload</button>

      {loading && (
        <div>
          <p>Uploading...</p>
          <p>{progress}%</p>
        </div>
      )}

      {error && <p>{error}</p>}

      {isCompleted && <p>Upload Complete</p>}
    </div>
  );
};
```

#### Examples

##### Create a new document with an attachment

```tsx
export const CreateUser = () => {

  const { upload, error, loading } = useFrappeFileUpload();

  const { createDoc } = useFrappeCreateDoc();

  const { updateDoc } = useFrappeUpdateDoc();

  const [email, setEmail] = useState<string>("");
  const [firstName, setFirstName] = useState<string>("");
  const [file, setFile] = useState<File>();

  const createUser = () => {
    const file = e.target.files[0];
    if (file) {
      createDoc("User", {
        email: email,
        first_name: first_name,
      })
        .then((doc) => {
          return upload(file, {
            is_private: 1,
            doctype: "User",
            docname: doc.name,
            fieldname: "user_image",
          });
        })
        .then((file) => {
          return updateDoc("User", user, {
            user_image: file.file_url,
          });
        })
        .then(() => {
          alert("User created");
        });
    }
  };

  return (
    <div>
      {loading && <p>Uploading...</p>}
      {error && <p>{error}</p>}
      <input
        type="text"
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setEmail(e.target.value)
        }
      />
      <input
        type="text"
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setFirstName(e.target.value)
        }
      />
      <input type="file" name="attachment" onChange={(e) => setFile(e)} />
      <button onClick={createUser}>Create</button>
    </div>
  );
};
```

##### Upload multiple files

```tsx
export const MultipleFileUpload = () => {
    
  const { upload, error, loading } = useFrappeFileUpload();

  const [files, setFiles] = useState<FileList>([]);

  const handleUpload = () => {
    if (files.length) {
      const promises = files.map(async (f: CustomFile) => {
        let docname = "";
        setUploading(true);
        return createDoc("Drawing File", {
          ...data,
          file_name: f.name.split(".pdf")[0],
          batch_name: batchID,
        })
          .then((d) => {
            docname = d.name;
            return upload(f, {
              isPrivate: true,
              doctype: "Drawing File",
              docname: d.name,
              fieldname: "file",
            });
          })
          .then((r) => {
            return updateDoc("Drawing File", docname, {
              file: r.file_url,
            });
          });
      });

      Promise.all(promises)
        .then(() => {
          alert("Files uploaded");
        })
        .catch((e) => {
          console.error(e);
          alert("Error uploading files");
        });
    }
  };

  return (
    <div>
      <input type="file" onChange={handleUpload} />
      {loading && <p>Uploading...</p>}
      {error && <p>{error}</p>}
    </div>
  );
};
```

<br/>