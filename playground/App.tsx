import { ref } from '@/index'
import { Button } from './components/Button'
import { DemoSection } from './components/DemoSection'
import { Input } from './components/Input'
import { InputNumber } from './components/InputNumber'
import { Select } from './components/Select'
import { Tooltip } from './components/Tooltip'

export const App = () => {
  const inputState = {
    text: ref('text'),
    num: ref(123),
  }

  const selectState = {
    value: ref(1),
    options: ref([
      {
        label: '1',
        value: 1,
      },
      {
        label: '2',
        value: 2,
      },
    ]),
  }

  return (
    <div class="max-w-700px mx-auto">
      <h2>R(eactive)sx Preview</h2>
      <p>响应式 JSX，测试看看效果怎么样。</p>
      <h2>Components</h2>

      <div class="flex flex-col gap-1">
        <DemoSection title="Button" description="按钮组件预览">
          <Button>Button</Button>
          <Button type="link">Link Button</Button>
        </DemoSection>
        <DemoSection title="Tooltip">
          <div class="flex flex-col gap-2">
            <div>
              <Tooltip>
                Hover me
                <Tooltip.Content>
                  <p>This is content</p>
                </Tooltip.Content>
              </Tooltip>
            </div>
          </div>
        </DemoSection>
        <DemoSection title="Select">
          <div class="flex flex-col gap-2">
            <Select options={selectState.options} $value={selectState.value} />
            {selectState.value}
          </div>
        </DemoSection>
        <DemoSection title="Input">
          <div class="flex flex-col gap-2">
            <div class="flex gap-1 items-center">
              <span>Text:</span>
              <Input $value={inputState.text} />
              <span>{inputState.text}</span>
              <Button
                onClick={() => {
                  inputState.num.value = inputState.text
                    .value as unknown as number
                }}
              >
                Apply to InputNumber
              </Button>
            </div>

            <div class="flex gap-1 items-center">
              <span>Number:</span>
              <InputNumber $value={inputState.num} />
              <span>{inputState.num}</span>
            </div>
          </div>
        </DemoSection>
      </div>
    </div>
  )
}
