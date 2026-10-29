// Device access remains paired when leaving the editor. To revoke a trusted
// browser, remove its record from museum_trusted_devices through administration.
export function GET(){return Response.redirect('/',303);}
