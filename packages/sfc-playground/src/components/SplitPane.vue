<template>
  <div
    ref="container"
    class="split-pane"
    :class="{ dragging, 'is-horizontal': horizontal }"
    :style="splitPaneStyle"
    @mousemove="dragMove"
    @mouseup="dragEnd"
    @mouseleave="dragging = false"
  >
    <div class="split-pane__left" :style="leftStyle">
      <slot name="left" />
    </div>
    <div
      class="split-pane__dragger before:bg-blue-gray-300 after:bg-blue-gray-300 dark:before:bg-true-gray-700 dark:after:bg-true-gray-700"
      :style="draggerStyle"
      @mousedown.prevent="dragStart"
    />
    <div class="split-pane__right" :style="rightStyle">
      <slot name="right" />
    </div>
  </div>
</template>

<script lang="ts">
import { ref, reactive, defineComponent, toRefs, computed, onMounted, onUnmounted } from 'vue'
import { debounce } from '../utils'

export default defineComponent({
  name: 'SplitPane',

  props: {
    horizontal: { type: Boolean, default: false }
  },

  setup (props, { emit }) {
    const container = ref()

    const state = reactive({
      dragging: false,
      split: 50,
      isHorizontal: computed(() => props.horizontal)
    })

    function boundSplit () {
      const { split } = state
      return split < 20
        ? 20
        : split > 80
          ? 80
          : split
    }

    let startPositionX = 0
    let startPositionY = 0
    let startSplit = 0

    function dragStart (e: MouseEvent) {
      state.dragging = true
      startPositionX = e.pageX
      startPositionY = e.pageY
      startSplit = boundSplit()
    }

    function dragMove (e: MouseEvent) {
      if (state.dragging) {
        const totalSize = container.value.offsetWidth
        const position = state.isHorizontal ? e.pageY : e.pageX
        const dp = position - (state.isHorizontal ? startPositionY : startPositionX)
        state.split = startSplit + ~~(dp / totalSize * 100)

        emit('resize', [
          { size: boundSplit() },
          { size: (100 - boundSplit()) }
        ])
      }
    }

    function dragEnd () {
      if (!state.dragging) return
      state.dragging = false

      emit('resized', [
        { size: boundSplit() },
        { size: (100 - boundSplit()) }
      ])
    }

    // const onResize = () => {
    //   const containerSize = container.value.offsetWidth
    //   state.isHorizontal = containerSize > 720
    // }

    const splitPaneStyle = computed(() => {
      return {
        'flex-direction': state.isHorizontal ? 'column' : 'row'
      }
    })

    const leftStyle = computed(() => {
      return state.isHorizontal
        ? { height: boundSplit() + '%' }
        : { width: boundSplit() + '%' }
    })

    const rightStyle = computed(() => {
      return state.isHorizontal
        ? { height: (100 - boundSplit()) + '%' }
        : { width: (100 - boundSplit()) + '%' }
    })

    const draggerStyle = computed(() => {
      return state.isHorizontal
        ? {
            left: 0, right: 0, bottom: 0, cursor: 'row-resize',
            borderTop: '1px solid var(--border-color)',
            borderBottom: '1px solid var(--border-color)'
          }
        : {
            top: 0, bottom: 0, right: 0, cursor: 'col-resize',
            borderLeft: '1px solid var(--border-color)',
            borderRight: '1px solid var(--border-color)'
          }
    })

    // onMounted(() => {
    //   window.addEventListener('resize', onResize, false)
    //   onResize()
    // })

    // onUnmounted(() => {
    //   window.removeEventListener('resize', onResize, false)
    // })

    return {
      container,
      dragStart,
      dragMove,
      dragEnd,
      boundSplit,
      splitPaneStyle,
      leftStyle,
      rightStyle,
      draggerStyle,
      ...toRefs(state)
    }
  }
})
</script>

<style lang="scss" scoped>
.split-pane {
  display: flex;
  height: 100%;
  background-color: inherit;
}
.split-pane.dragging {
  cursor: col-resize;
}
.split-pane.dragging.is-horizontal {
  cursor: row-resize;
}
.dragging .split-pane__left,
.dragging .split-pane__right {
  pointer-events: none;
}
.split-pane__left,
.split-pane__right {
  position: relative;
  height: 100%;
}
.split-pane__dragger {
  box-sizing: border-box;
  position: relative;
  z-index: 1;
  padding: 0;
  background-color: transparent;
  border-color: transparent;
  border: none;
  min-height: 1rem;
  min-width: 1rem;
  transition: all .1s ease;

  &::before,
  &::after {
    content: "";
    // background-color: var(--border-color);
    box-sizing: border-box;
    outline: none;
    -webkit-tap-highlight-color: transparent;
    position: absolute;
    top: 50%;
    left: 50%;
    pointer-events: none;
    height: 2.5em;
    width: 1px;
    transition: all .1s ease;
  }
  &::before {
    margin-right: 5px;
    right: 0;
  }
  &::after {
    margin-left: 5px;
    left: 0;
  }
}

.split-pane.is-horizontal {
  .split-pane__dragger {
    &::before,
    &::after {
      width: 2.5em;
      height: 1px;
      left: 50%;
    }
    &::before {
      margin: 0;
      margin-top: 5px;
      top: 0;
    }
    &::after {
      margin: 0;
      margin-bottom: 5px;
      bottom: 0;
    }
  }
}
</style>
