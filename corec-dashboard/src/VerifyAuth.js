function VerifyAuth() {
  if (localStorage.getItem("access")) {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: localStorage.getItem("access")
      }),
    };
    fetch("/auth", requestOptions)
    .then(res => res.json())
    .then(response => {
      console.log(response.status);
      if (response.status == "success") {
        return true;
      } else {
        return false;
      }
    })
  }
}

export default VerifyAuth;