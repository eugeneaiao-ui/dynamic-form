# Security policy

## Supported versions

The current `0.1.x` release line receives fixes. Update to the latest patch before reporting a problem. Formino is pre-1.0; public API changes are recorded in the changelog.

## Report a vulnerability privately

Use [GitHub private vulnerability reporting](https://github.com/eugeneaiao-ui/formino/security/advisories/new). Include the affected version, a minimal reproduction, impact and any proposed fix. Remove credentials and real business data. Avoid disclosing an unpatched vulnerability in a public issue or discussion.

## Host application responsibilities

Form definitions can contain application callbacks, data-source adapters and custom components. Only load executable configuration from trusted code. The JSON example validates a supported configuration subset; it does not make arbitrary scripts or HTML safe.

The host application remains responsible for server-side validation, authorization and safe handling of uploaded files and user content. A client-side hidden or disabled field is not an authorization control.

## Ordinary bugs and questions

Use [Issues](https://github.com/eugeneaiao-ui/formino/issues) for reproducible bugs and [Discussions](https://github.com/eugeneaiao-ui/formino/discussions) for usage questions.
