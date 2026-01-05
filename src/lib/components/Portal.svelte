<script>

  let {target = 'body', children} = $props()

</script>

<script module>
  import { tick } from "svelte";

  /**
   * Usage: <div use:portal={'css selector'}> or <div use:portal={document.body}>
   *
   */

  const positions = {
    "end": (targetEl, el) => {
      targetEl.appendChild(el)
    },

    "start": (targetEl, el) => {
      targetEl.insertBefore(el, targetEl.childNodes[0] || null)
    }
  }

  async function findTarget(target) {
    let targetEl;

    if (Array.isArray(target)) {
      const errors = [];

      for (const t of target) {
        try {
          targetEl = await findTarget(t)
          return targetEl
        } catch(e) {
          errors.push(e)
        }

        if (targetEl === null) {
          throw new Error(
            `All selectors have failed: ${errors}`
          );
        }
      }
    } else if (typeof target === "string") {
      targetEl = document.querySelector(target);

      if (targetEl === null) {
        await tick();
        targetEl = document.querySelector(target);
      }

      if (targetEl === null) {
        throw new Error(
          `No element found matching css selector: "${target}"`
        );
      }
    } else if (target instanceof HTMLElement) {
      targetEl = target;
    } else {
      throw new TypeError(
        `Unknown portal target type: ${
          target === null ? "null" : typeof target
        }. Allowed types: string (CSS selector) or HTMLElement.`
      );
    }

    return targetEl
  }

  export function portal(el, {target = "body", position = "end"}) {
    let targetEl;

    async function update(newTarget) {
      targetEl = await findTarget(newTarget)

      positions[position](targetEl, el)

      el.hidden = false;
    }

    function destroy() {
      if (el.parentNode) {
        el.parentNode.removeChild(el);
      }
    }

    update(target);

    return {
      update,
      destroy,
    };
  }
</script>

<div use:portal={target} hidden>
  {@render children()}
</div>
