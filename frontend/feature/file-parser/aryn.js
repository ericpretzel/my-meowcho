// // call AWS Lambda function through HTTP API to get study guide
// export default function getStudyGuide() {
//     console.log('getStudyGuide called');
//     const url = 'https://u39ugs9lcj.execute-api.us-east-1.amazonaws.com/meowchoGetStudyGuide';
//     const file = 'https://www.gradescope.com/courses/460050/assignments/2459744/submissions/150744978.pdf';
//     const responseJSON = fetch(url, {
//         method: 'GET',
//         body: JSON.stringify({ file: file }),
//         headers: {
//             'Content-Type': 'application/json'
//         }
//     })
//     .then(response => response.json())
//     .catch(error => console.error('Error:', error))
//     return responseJSON;
// }

export default function getStudyGuide(file) {
    const url = 'https://u39ugs9lcj.execute-api.us-east-1.amazonaws.com/meowchoGetStudyGuide';
    // send raw binary
    return fetch(url, {
        method: 'POST',
        body: file
    });
}